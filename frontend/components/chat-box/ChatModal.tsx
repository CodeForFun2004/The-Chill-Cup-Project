// components/chat-bot/ChatModal.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator, // For loading indicator
  Dimensions, // To get screen dimensions for responsive sizing
  // ImageSourcePropType // Not strictly needed if require is used correctly
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons"; // Using Expo vector icons for send/toggle buttons
import RenderHtml from "react-native-render-html"; // To render HTML from backend

// Import the bot avatar image
// Make sure this path is correct relative to where ChatModal.tsx is located
// For React Native, you typically use require() for local images
// Define botAvatar as a constant at the top level
import botAvatar from "../../assets/images/chat-box/avatar2.png";

// Get screen width for responsive design
const { width } = Dimensions.get("window");

// Define the API endpoint
const API_ENDPOINT = "http://192.168.2.107:8080/api/chatbot"; // Corrected endpoint

interface Message {
  text: string;
  fromUser: boolean;
}

function ChatModal() {
  // State to manage modal visibility. Starts hidden, user taps button to open.
  const [isOpen, setIsOpen] = useState(false);
  // State to store chat messages. Initial message from bot.
  const [messages, setMessages] = useState<Message[]>([
    { text: "Xin chào, tôi có thể giúp gì cho bạn?", fromUser: false },
  ]);
  // State for the text input field
  const [input, setInput] = useState("");
  // State to show loading indicator while waiting for AI response
  const [loading, setLoading] = useState(false);

  // Ref for ScrollView to enable auto-scrolling to the bottom
  const scrollViewRef = useRef<ScrollView>(null);

  // Function to scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Effect to scroll to bottom whenever messages array updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to toggle the visibility of the chat modal
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // Function to send a message to the chatbot API
  const sendMessage = async (messageToSend: string = input) => {
    // Don't send empty messages or if already loading
    if (messageToSend.trim() === "" || loading) return;

    // Add user's message to the chat
    const userMessage: Message = { text: messageToSend, fromUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input field
    setLoading(true); // Show loading indicator

    try {
      // Send POST request to your backend API
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: messageToSend }),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const data = await response.json();

      // Add bot's response to the chat
      const botMessage: Message = {
        text:
          data.answer ||
          "Xin lỗi, tôi không thể trả lời câu hỏi này vào lúc này.",
        fromUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi gọi API chatbot:", error);
      // Add an error message if API call fails
      setMessages((prev) => [
        ...prev,
        {
          text: "Đã xảy ra lỗi khi kết nối server. Vui lòng thử lại.",
          fromUser: false,
        },
      ]);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Define the base style for HTML rendering
  const tagsStyles = {
    body: {
      fontSize: 14,
      color: "#333",
      fontFamily: "Inter",
    },
    strong: {
      fontWeight: "bold" as const, // 👈 'as const' sẽ lock type chính xác
      color: "#333",
    },
    ul: {
      marginBottom: 5,
      paddingLeft: 10,
    },
    li: {
      marginBottom: 2,
      paddingLeft: 5,
    },
    br: {
      height: 0,
    },
  };

  return (
    <View style={styles.container}>
      {/* Chat Modal */}
      {isOpen && (
        <View style={styles.chatModal}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <View style={styles.botAvatarHeader}>
              {/* Use the botAvatar variable here */}
              <Image source={botAvatar} style={styles.avatar} />
            </View>
            <Text style={styles.chatTitle}>Chill Cup Chatbot</Text>
            <View style={styles.separator} />
          </View>

          {/* Chat Body - Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatBody}
            contentContainerStyle={styles.chatMessagesContainer}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  msg.fromUser ? styles.userRow : styles.botRow,
                ]}
              >
                {!msg.fromUser && (
                  <View style={styles.botMessageAvatar}>
                    {/* Use the botAvatar variable here */}
                    <Image source={botAvatar} style={styles.avatarSmall} />
                  </View>
                )}
                <View
                  style={[
                    styles.chatMessage,
                    msg.fromUser ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  {/* Render HTML for bot messages, plain text for user messages */}
                  {msg.fromUser ? (
                    <Text style={styles.messageText}>{msg.text}</Text>
                  ) : (
                    <RenderHtml
                      contentWidth={width * 0.6} // Adjust content width for HTML rendering
                      source={{ html: msg.text }}
                      tagsStyles={tagsStyles}
                    />
                  )}
                </View>
              </View>
            ))}
            {/* Loading indicator message */}
            {loading && (
              <View style={[styles.messageRow, styles.botRow]}>
                <View style={styles.botMessageAvatar}>
                  {/* Use the botAvatar variable here */}
                  <Image source={botAvatar} style={styles.avatarSmall} />
                </View>
                <View
                  style={[
                    styles.chatMessage,
                    styles.botMessage,
                    styles.loadingMessage,
                  ]}
                >
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.loadingText}>Đang trả lời...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Chat Input Container */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()} // Send on Enter key press
              editable={!loading} // Disable input when loading
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendMessage()}
              disabled={loading} // Disable button when loading
            >
              <Ionicons name="send" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Toggle Button */}
      <TouchableOpacity style={styles.chatToggleButton} onPress={toggleModal}>
        <Ionicons
          name={isOpen ? "chevron-down-circle" : "chatbox"} // Icon changes based on modal state
          size={30}
          color="#FFF"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  position: "absolute",
  bottom: 80,
  right: 20,
  zIndex: 10000,
  elevation: 10000, // Android: đảm bảo nổi trên cùng
},
  chatModal: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    overflow: "hidden",
    // Fixed size for the modal, adjust as needed for mobile
    width: width * 0.85, // 85% of screen width
    height: Dimensions.get("window").height * 0.6, // 60% of screen height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8, // For Android shadow
    marginBottom: 15, // Space between modal and toggle button
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
    backgroundColor: "#4AA366", // Purple header
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  botAvatarHeader: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make it round
    borderWidth: 2,
    borderColor: "#FFF",
  },
  chatTitle: {
    flex: 1, // Takes up remaining space
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatBody: {
    flex: 1, // Take available height
    padding: 10,
  },
  chatMessagesContainer: {
    paddingBottom: 10, // Add some padding at the bottom for scrolling
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  botMessageAvatar: {
    marginRight: 8,
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chatMessage: {
    maxWidth: "75%", // Limit message bubble width
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
userMessage: {
  backgroundColor: "#A7D7B5", // Light green for user messages
  alignSelf: "flex-end",
  borderBottomRightRadius: 5,
},
botMessage: {
  backgroundColor: "#DCDCDC", // Primary green for bot messages
  alignSelf: "flex-start",
  borderBottomLeftRadius: 5,
},
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  loadingMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCDCDC",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  loadingText: {
    marginLeft: 10,
    color: "#FFF",
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    padding: 10,
    backgroundColor: "#FFF",
  },
  textInput: {
    flex: 1, // Takes up most of the space
    height: 40,
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 14,
    backgroundColor: "#F9F9F9",
  },
sendButton: {
  backgroundColor: "#3B854F", // Darker green for send button
  borderRadius: 25,
  width: 45,
  height: 45,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
},
  chatToggleButton: {
    backgroundColor: "#4AA366", // Purple toggle button
    borderRadius: 30, // Make it round
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
});

export default ChatModal;
