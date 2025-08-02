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
  const { seller, isLoading: userLoading } = useSeller({ enabled: true });
  const conversationId = searchParams.get("conversationId");
  const { ws } = useWebSocket();
  const queryClient = useQueryClient();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${conversationId}?page=1`
      );
      setHasFetchedOnce(true);
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
    }
  }, [conversationId, chats]);

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
    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);

      if (data.type === "NEW_MESSAGE") {
        const newMsg = data?.payload;

        if (newMsg.conversationId === conversationId) {
          queryClient.setQueryData(
            ["messages", conversationId],
            (old: any = []) => [
              ...old,
              {
                content: newMsg.messageBody || newMsg.content || "",
                senderType: newMsg.senderType,
                seen: false,
                createdAt: newMsg.createdAt || new Date().toISOString(),
              },
            ]
          );
          scrollToBottom();
        }

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === newMsg.conversationId
              ? { ...chat, lastMessage: newMsg.content }
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
    };
  }, [ws, conversationId]);

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
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
    }
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedChat ||
      !ws ||
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

    ws.send(JSON.stringify(payload));

    setMessage("");
    scrollToBottom();
  };

  return (
    <div className="w-full bg-gray-50">
      <div className="md:w-[90%] mx-auto pt-5">
        <div className="flex flex-col md:flex-row h-[80vh] rounded-lg shadow border overflow-hidden">
          {/* Chat Sidebar */}
          <div className="w-full md:w-[320px] border-r bg-white shadow-inner">
            <div className="p-4 border-b text-lg font-semibold text-gray-800">
              Messages
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="py-5 text-sm text-center text-gray-500">
                  Loading...
                </div>
              ) : chats.length === 0 ? (
                <div className="py-5 text-sm text-center text-gray-500">
                  No Conversation
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;
                  return (
                    <button
                      key={chat.conversationId}
                      onClick={() => handleChatSelect(chat)}
                      className={`w-full text-left px-4 py-3 transition hover:bg-gray-50 ${
                        isActive ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={chat.user?.avatar || ""}
                          alt={chat.user?.name}
                          width={36}
                          height={36}
                          className="rounded-full object-cover border w-10 h-10"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800">
                              {chat.user?.name}
                            </span>
                            {chat.user?.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate max-w-[170px]">
                              {chat.lastMessage || ""}
                            </p>
                            {chat?.unreadCount > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-[16px] px-[6px] rounded-full text-[10px] font-semibold bg-blue-600 text-white">
                                {chat?.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {selectedChat ? (
              <>
                <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm">
                  <Image
                    src={selectedChat.user?.avatar || ""}
                    alt={selectedChat.user.name}
                    width={40}
                    height={40}
                    className="rounded-full border object-cover w-10 h-10"
                  />
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat.user?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.user?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm bg-gray-50"
                >
                  {messages.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.senderType === "seller"
                          ? "items-end ml-auto"
                          : "items-start"
                      } max-w-[75%]`}
                    >
                      <div
                        className={`${
                          msg.senderType === "seller"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        } px-4 py-2 rounded-xl shadow-sm`}
                      >
                        {msg.text || msg.content}
                      </div>
                      <div
                        className={`text-[11px] text-gray-400 mt-1 ${
                          msg.senderType === "seller" ? "text-right" : "text-left"
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
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
