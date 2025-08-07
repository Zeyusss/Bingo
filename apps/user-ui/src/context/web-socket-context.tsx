'use client'

import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider =({
    children,
    user
}:{
    children:React.ReactNode;
    user:any;
})=>{
    const [wsReady,setWsReady]=useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const [unreadCounts,setUnreadCounts] = useState<Record<string,number>>({});

    useEffect(()=>{
    if(!user?.id) return;
    const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_wEBSOCKET_URI!);
    wsRef.current = ws;

    ws.onopen = ()=>{
        ws.send(`user_${user.id}`);
        setWsReady(true);
    }

    ws.onmessage = (event)=>{
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if(data.type === "UNSEEN_COUNT_UPDATE"){
            const {conversationId,count} = data.payload;
            setUnreadCounts((prev:any)=> ({...prev,[conversationId]: count}));
        }
        // Note: NEW_MESSAGE handling is done in the inbox page component
    }
    return ()=>{
        ws.close()
    }
    },[user?.id])

    return (
        <WebSocketContext.Provider value={{ws:wsRef.current,unreadCounts,wsReady}}>
        {children}
    </WebSocketContext.Provider>
    )
}

export const useWebSocket = ()=> useContext(WebSocketContext);