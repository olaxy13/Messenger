import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import  { io } from "socket.io-client"
export const ChatContext =  createContext();

export const ChatContextProvider = ({ children, user }) => { 
    const [userChats, setUserChats] = useState(null); 
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [ potentialChats, setPotentialChats ] = useState([]);
    const [currentChat, setCurrentChat ] = useState(null);
    const [messages, setMessages ] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading,] = useState(false);
    const [messagesError, setMessagesError ] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null)
    const [newMessage, setNewMessage] = useState(null)
    const [ socket, setSocket ] = useState(null);
    const [ onlineUsers, setOnlineUsers ] = useState([]);
    const [ notifications, setNotification ] = useState([])

    console.log("notifications", notifications)

    console.log("onlineUsers", onlineUsers);

    useEffect(()=> {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);
        
        return()=> {
            newSocket.disconnect();
        }
    }, [user]);

//add online users
    useEffect(()=> {
        if(socket === null ) return
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res)=> {  
            setOnlineUsers(res)
        })
        return ()=> {
            socket.off("getOnlineUsers")
 
           }
    }, [socket, onlineUsers])

    //send MEssage
    useEffect(()=> {
        if(socket === null ) return;

        const recipientId = currentChat?.members?.find((id) => id !== user?._id);

        socket.emit("sendMessage", {...newMessage, recipientId})
    
    }, [newMessage])

        //Recieve Message and Notification
        useEffect(()=> {
            if(socket === null ) return;
            socket.on("getMessage", res => {
                if(currentChat?._id !== res.chatId) return

                setMessages((prev) => [...prev, res])
            })

            socket.on("getNotification", (res) => {
                const isChatOpen = currentChat?.members.some(id => id === res.senderId)

                if(isChatOpen) {
                    setNotification((prev) => [{...res, isRead: true}, ...prev ])
                }else {
                    setNotification((prev) => [...prev, res ])
                }
            })

            return () => {
                socket.off("getMessage")
                socket.off("getNotification")
            }

        }, [socket, currentChat])


    useEffect(()=> {
        const getUsers = async  ()=> {
            const response = await getRequest(`${baseUrl}/users`);

            if(response.error) {
                return console.log("Error fetcing users", response)
            }
            const pChats = response.filter((u)=> {
                let isChatCreated = false;

                if(user?._id === u._id) return false

                if(userChats) {
                    isChatCreated = userChats?.some((chat)=> {
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                  
                    });
                }
                return !isChatCreated
            })
            setPotentialChats(pChats)
        }
        getUsers();
    }, [userChats, onlineUsers]);
    
    useEffect(() => {
        const getUserChats = async () => { 
            if(user?._id) {

                setIsUserChatsLoading(true);
                setUserChatsError(null)

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
                setIsUserChatsLoading(false)
                if(response.error){
                    return setUserChatsError(response)
                }
                setUserChats(response)
            }
        } 
        getUserChats();
    }, [user]);


    useEffect(() => {
        const getMessages = async () => { 
                setIsMessagesLoading(true);
                
                setMessagesError(null)
               
                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);
                setIsMessagesLoading(false)
              
                if(response.error){
                    return setMessagesError(response)
                }
                setMessages(response)
        } 
        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage)=> {
        if(!textMessage) return console.log("You must type something...")
           // console.log("sender", sender)
        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage
        }));
        if(response.error){
            return setSendTextMessagesError(response)
        }

        setNewMessage(response)
        setMessages((prev)=> [...prev, response])
        setTextMessage("")
    }, [])

    const updateCurrentChat = useCallback((chat)=>  {
        setCurrentChat(chat)
    }, 
 [])




    const createChat = useCallback(async (firstId, secondId)=> {
        const response = await getRequest(`${baseUrl}/chats`, JSON.stringify({
            firstId,
            secondId
        })
);
    if(response.error) {
    return console.log("Error creating chat", response)
    }
    setUserChats((prevChats) => [...prevChats, response]);
    }, [])

    return <ChatContext.Provider value={{
        userChats,
        isUserChatsLoading,
        userChatsError,
        potentialChats,
        currentChat,
        createChat,
        updateCurrentChat,
        messages,
        setIsMessagesLoading,
        messagesError,
        sendTextMessage,
        onlineUsers,
        
    }}>
        {children}

    </ChatContext.Provider>
}