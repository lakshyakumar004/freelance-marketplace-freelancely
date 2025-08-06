import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  VStack,
  Heading,
  Divider,
  useColorModeValue,
  Avatar,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "../socket";

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const lastMessageRef = useRef(null);

  const bg = useColorModeValue("gray.100", "gray.700");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const msgInputBg = useColorModeValue("white", "gray.900");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ✅ Join personal socket room
  useEffect(() => {
    if (user?._id) {
      socket.emit("joinRoom", user._id);
    }
  }, [user?._id]);

  // ✅ Fetch conversations OR search results
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let res;
        if (search.trim()) {
          res = await axios.get(
            `http://localhost:5000/api/users?search=${search}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          res = await axios.get(
            "http://localhost:5000/api/users/conversations",
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        setConversations(res.data.users);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();
  }, [search, token]);

  // ✅ Fetch messages for selected user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchMessages();
  }, [selectedUser, token]);

  // ✅ Listen for socket events
  useEffect(() => {
    socket.on("newMessage", (msg) => {
      if (
        msg.senderId === selectedUser?._id ||
        msg.receiverId === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // ✅ New: Listen for `newConversation`
    socket.on("newConversation", (newUser) => {
      setConversations((prev) => {
        const exists = prev.find((u) => u._id === newUser._id);
        if (exists) return prev;
        return [newUser, ...prev];
      });
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("newConversation");
    };
  }, [selectedUser]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser) return;

    const msgData = {
      receiverId: selectedUser._id,
      content: newMsg,
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        msgData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...messages, res.data.message]);
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    socket.emit("typing", {
      senderId: user._id,
      receiverId: selectedUser?._id,
    });
  };

  return (
    <Flex h="100vh" direction={{ base: "column", md: "row" }}>
      {/* Sidebar */}
      <Box
        w={{ base: "100%", md: "25%" }}
        bg={sidebarBg}
        p={4}
        borderRight={{ md: "1px solid #ccc" }}
        borderBottom={{ base: "1px solid #ccc", md: "none" }}
        display="flex"
        flexDirection="column"
      >
        <Heading size="md" mb={3} color="teal.600">
          Conversations
        </Heading>

        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={useColorModeValue("gray.50", "gray.700")}
          />
        </InputGroup>

        <VStack align="stretch" spacing={3} overflowY="auto" flex="1" pr={2}>
          {conversations.map((u) => (
            <Flex
              key={u._id}
              p={3}
              borderRadius="md"
              bg={selectedUser?._id === u._id ? "teal.100" : bg}
              _hover={{ bg: "teal.50" }}
              align="center"
              gap={3}
              cursor="pointer"
              onClick={() => setSelectedUser(u)}
              transition="all 0.2s ease"
            >
              <Avatar size="sm" name={u.fullName} />
              <Box>
                <Text fontWeight="medium">{u.fullName}</Text>
                <Text fontSize="sm" color="gray.500">{u.email}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Chat Window */}
      <Flex flex="1" direction="column" p={6} bg={bg}>
        {selectedUser ? (
          <>
            <Heading size="md" color="teal.700" mb={2}>
              Chat with {selectedUser.fullName}
            </Heading>
            <Divider mb={4} />

            <VStack
              spacing={2}
              align="stretch"
              flex="1"
              overflowY="auto"
              px={2}
              py={4}
              borderRadius="lg"
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="md"
            >
              {messages.map((msg, index) => (
                <Box
                  key={msg._id}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  maxW="75%"
                  alignSelf={
                    msg.senderId === user._id ? "flex-end" : "flex-start"
                  }
                  bg={msg.senderId === user._id ? "teal.300" : "gray.300"}
                  color="black"
                  px={4}
                  py={2}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Text fontSize="sm">{msg.content}</Text>
                  <Text
                    fontSize="xs"
                    mt={1}
                    textAlign="right"
                    color="gray.600"
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Box>
              ))}
              {isTyping && (
                <Text fontSize="sm" color="gray.500" px={2}>
                  {selectedUser.fullName} is typing...
                </Text>
              )}
            </VStack>

            {/* Input Box */}
            <Flex mt={4} gap={2}>
              <Input
                placeholder="Type your message..."
                bg={msgInputBg}
                value={newMsg}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button colorScheme="teal" onClick={sendMessage}>
                Send
              </Button>
            </Flex>
          </>
        ) : (
          <Flex flex="1" align="center" justify="center">
            <Text fontSize="lg" color="gray.600">
              Select a user to start chatting.
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default ChatPage;
