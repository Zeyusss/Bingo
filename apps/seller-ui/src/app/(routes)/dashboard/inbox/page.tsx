"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import ChatInput from "apps/seller-ui/src/shared/components/chats/chatinput";
import { useWebSocket } from "apps/seller-ui/src/context/web-socket-context";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";

const ChatPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { seller } = useSeller({ enabled: true });
  const conversationId = searchParams.get("conversationId");
  const { ws } = useWebSocket();
  const queryClient = useQueryClient();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [markedAsSeenConversations, setMarkedAsSeenConversations] = useState<Set<string>>(new Set());

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${conversationId}?page=1`
      );
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [conversationId, message.length]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
      
      // Mark as seen when conversation is loaded from URL (e.g., after refresh)
      if (chat && ws && ws.readyState === WebSocket.OPEN && !markedAsSeenConversations.has(conversationId)) {
        setChats((prev) =>
          prev.map((c) =>
            c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
        ws.send(
          JSON.stringify({
            type: "MARK_AS_SEEN",
            conversationId: conversationId,
          })
        );
        setMarkedAsSeenConversations(prev => new Set(prev).add(conversationId));
      }
    }
  }, [conversationId, chats, ws, markedAsSeenConversations]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    });
  };

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/chatting/api/get-seller-conversations"
      );
      return res.data.conversations;
    },
  });

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MESSAGE") {
        const newMsg = data?.payload;
        if (newMsg.conversationId === conversationId) {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: any = []) => {
              const isOwnMessage =
                newMsg.senderType === "seller" &&
                newMsg.senderId === seller?.id;

              if (isOwnMessage) {
                const filteredMessages = old.filter(
                  (msg: any) => !msg.isOptimistic
                );
                return [
                  ...filteredMessages,
                  {
                    content: newMsg.messageBody || newMsg.content || "",
                    senderType: newMsg.senderType,
                    seen: false,
                    createdAt: newMsg.createdAt || new Date().toISOString(),
                  },
                ];
              } else {
                return [
                  ...old,
                  {
                    content: newMsg.messageBody || newMsg.content || "",
                    senderType: newMsg.senderType,
                    seen: false,
                    createdAt: newMsg.createdAt || new Date().toISOString(),
                  },
                ];
              }
            }
          );
          scrollToBottom();
        }

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === newMsg.conversationId
              ? { ...chat, lastMessage: newMsg.content || newMsg.messageBody }
              : chat
          )
        );
      }
      if (data.type === "UNSEEN_COUNT_UPDATE") {
        const { conversationId, count } = data.payload;
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat
          )
        );
      }
      if (data.type === "USER_ONLINE_STATUS") {
        const { userId, isOnline } = data.payload;
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.user?.id === userId
              ? { ...chat, user: { ...chat.user, isOnline } }
              : chat
          )
        );
        if (selectedChat?.user?.id === userId) {
          setSelectedChat((prev: any) => prev ? {
            ...prev,
            user: { ...prev.user, isOnline }
          } : null);
        }
      }
    };

    ws.onmessage = handleMessage;

    return () => {
      ws.onmessage = null;
    };
  }, [ws, conversationId, queryClient]);

  const handleChatSelect = (chat: any) => {
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    router.push(`?conversationId=${chat.conversationId}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "MARK_AS_SEEN",
          conversationId: chat.conversationId,
        })
      );
      setMarkedAsSeenConversations(prev => new Set(prev).add(chat.conversationId));
    }
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedChat ||
      !ws ||
      !seller ||
      ws.readyState !== WebSocket.OPEN
    )
      return;

    const payload = {
      fromUserId: seller.id,
      toUserId: selectedChat.user.id,
      messageBody: message,
      conversationId: selectedChat.conversationId,
      senderType: "seller",
    };

    const tempMessageId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage = {
      id: tempMessageId,
      content: message,
      senderType: "seller",
      seen: false,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    queryClient.setQueryData(
      ["messages", selectedChat.conversationId],
      (old: any = []) => [...old, optimisticMessage]
    );

    ws?.send(JSON.stringify(payload));
    
    // Mark as seen when sending a message
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "MARK_AS_SEEN",
          conversationId: selectedChat.conversationId,
        })
      );
    }
    
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId === selectedChat.conversationId
          ? { ...chat, lastMessage: payload.messageBody, unreadCount: 0 }
          : chat
      )
    );
    setMarkedAsSeenConversations(prev => new Set(prev).add(selectedChat.conversationId));
    setMessage("");
    scrollToBottom();
  };

  const handleSendImage = (imageUrl: string) => {
    if (!selectedChat || !ws || !seller) return;

    const payload = {
      fromUserId: seller.id,
      toUserId: selectedChat.user.id,
      messageBody: imageUrl,
      conversationId: selectedChat.conversationId,
      senderType: "seller",
    };

    const tempMessageId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage = {
      id: tempMessageId,
      content: imageUrl,
      senderType: "seller",
      seen: false,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    queryClient.setQueryData(
      ["messages", selectedChat.conversationId],
      (old: any = []) => [...old, optimisticMessage]
    );

    ws.send(JSON.stringify(payload));

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId === selectedChat.conversationId
          ? { ...chat, lastMessage: "📷 Image" }
          : chat
      )
    );

    scrollToBottom();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Manage your customer conversations</p>
        </div>
        
        <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="w-full lg:w-80 border-r border-slate-200 bg-white">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-slate-500 text-sm">Loading conversations...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">No conversations yet</p>
                  <p className="text-slate-400 text-xs mt-1">Customer messages will appear here</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;
                  return (
                    <button
                      key={chat.conversationId}
                      onClick={() => handleChatSelect(chat)}
                      className={`w-full text-left p-4 transition-colors duration-200 hover:bg-slate-50 ${
                        isActive ? "bg-blue-50 border-r-2 border-blue-600" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={
                              chat.user?.avatar ||
                              "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
                            }
                            alt={chat.user?.name}
                            width={44}
                            height={44}
                            className="rounded-full object-cover border-2 border-white shadow-sm w-11 h-11"
                          />
                          {chat.user?.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`text-sm font-semibold truncate ${
                              isActive ? "text-blue-900" : "text-slate-900"
                            }`}>
                              {chat.user?.name}
                            </h3>
                            {chat?.unreadCount > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                {chat?.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${
                            isActive ? "text-blue-700" : "text-slate-500"
                          }`}>
                            {chat.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-50">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={
                        selectedChat.user?.avatar ||
                        "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
                      }
                      alt={selectedChat.user.name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white shadow-sm object-cover w-12 h-12"
                    />
                    {selectedChat.user?.isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-slate-900 font-semibold text-lg">
                      {selectedChat.user?.name}
                    </h2>
                    <p className={`text-sm flex items-center gap-1 ${
                      selectedChat.user?.isOnline ? "text-green-600" : "text-slate-500"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        selectedChat.user?.isOnline ? "bg-green-500" : "bg-slate-400"
                      }`} />
                      {selectedChat.user?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages Container */}
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
                >
                  {messages.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.senderType === "seller"
                          ? "items-end"
                          : "items-start"
                      } max-w-[80%] ${
                        msg.senderType === "seller" ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`${
                          msg.senderType === "seller"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-slate-900 border border-slate-200 shadow-sm"
                        } ${msg.messageType === "image" ? "p-2" : "px-4 py-3"} rounded-2xl max-w-full break-words`}
                      >
                        {msg.messageType === "image" || (msg.content && msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                          <div className="relative">
                            <img
                              src={msg.text || msg.content}
                              alt="Shared image"
                              className="max-w-full max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.text || msg.content, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<p class="text-sm text-slate-500 p-2">📷 Image failed to load</p>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">
                            {msg.text || msg.content}
                          </p>
                        )}
                      </div>
                      <div
                        className={`text-xs text-slate-400 mt-2 px-1 ${
                          msg.senderType === "seller"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {msg.time ||
                          new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                  ))}
                </div>

                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                  onSendImage={handleSendImage}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-medium text-lg mb-2">Welcome to Messages</h3>
                  <p className="text-slate-500 text-sm">Select a conversation from the sidebar to start chatting with your customers</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
