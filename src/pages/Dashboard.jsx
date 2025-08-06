import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  useColorModeValue,
  Spinner,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatIcon } from "@chakra-ui/icons"; // ✅ Chat icon
import AvailableProjects from "../components/AvailableProjects";
import YourProjects from "../components/YourProjects"; // ✅ Real-time YourProjects

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const modalTextColor = useColorModeValue("gray.800", "gray.100");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <Spinner size="xl" mt={20} ml={20} />;

  return (
    <Box minH="100vh" bg={bg}>
      {/* Navbar */}
      <Flex
        justify="space-between"
        align="center"
        px={8}
        py={5}
        bg="teal.500"
        color="white"
        boxShadow="md"
      >
        <Heading size="lg" fontWeight="bold">Freelancely</Heading>
        <HStack spacing={4}>
          <Tooltip label="Open Chat">
            <IconButton
              icon={<ChatIcon />}
              size="sm"
              colorScheme="teal"
              variant="outline"
              aria-label="Chat"
              onClick={() => navigate("/chat")}
            />
          </Tooltip>
          <Text fontSize="md" fontWeight="medium">{user.accountType}</Text>
          <Menu>
            <MenuButton>
              <Avatar size="sm" name={user.fullName || "User"} />
            </MenuButton>
            <MenuList bg="white" color="black" border="1px solid #ccc">
              <MenuItem _hover={{ bg: "gray.100" }} onClick={onOpen}>View Profile</MenuItem>
              <MenuItem _hover={{ bg: "gray.100" }} onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxH="80vh" overflowY="auto">
          <ModalHeader>Profile Info</ModalHeader>
          <ModalCloseButton />
          <ModalBody px={4} py={2} color={modalTextColor}>
            <VStack align="start" spacing={3}>
              <Text><strong>Full Name:</strong> {user.fullName || "N/A"}</Text>
              <Text><strong>Email:</strong> {user.email || "N/A"}</Text>
              <Text><strong>Account Type:</strong> {user.accountType || "N/A"}</Text>

              {user.accountType === "Freelancer" && (
                <>
                  <Text><strong>Username:</strong> {user.username || "N/A"}</Text>
                  <Text>
                    <strong>Skills:</strong>{" "}
                    {Array.isArray(user.skills) && user.skills.length > 0
                      ? user.skills.join(", ")
                      : "N/A"}
                  </Text>
                  <Text>
                    <strong>Experience Level:</strong>{" "}
                    {user.experienceLevel?.trim() ? user.experienceLevel : "N/A"}
                  </Text>
                  <Text>
                    <strong>Bio:</strong>{" "}
                    {user.bio?.trim() ? user.bio : "N/A"}
                  </Text>
                  <Text>
                    <strong>Hourly Rate:</strong>{" "}
                    {user.hourlyRate !== undefined &&
                    user.hourlyRate !== null &&
                    user.hourlyRate !== ""
                      ? `₹${user.hourlyRate}`
                      : "N/A"}
                  </Text>
                </>
              )}

              {user.accountType === "Client" && (
                <>
                  <Text><strong>Company:</strong> {user.company?.trim() || "N/A"}</Text>
                  <Text>
                    <strong>Project Description:</strong>{" "}
                    {user.projectDescription?.trim() || "N/A"}
                  </Text>
                  <Text>
                    <strong>Budget:</strong>{" "}
                    {user.budget !== undefined &&
                    user.budget !== null &&
                    user.budget !== ""
                      ? `₹${user.budget}`
                      : "N/A"}
                  </Text>
                </>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Dashboard Body */}
      <Box px={6} py={10}>
        <VStack spacing={6} align="stretch">
          {user.accountType === "Freelancer" ? (
            <>
              <AvailableProjects />

              <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={4}>Your Bids & Projects</Heading>
                <YourProjects /> {/* ✅ Using real-time version */}
              </Box>

              <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={2}>AI Matched Projects</Heading>
                <Text color="gray.600">
                  Projects matched based on your skills and experience.
                </Text>
              </Box>

              <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={2}>Portfolio Overview</Heading>
                <Text color="gray.600">
                  Showcase your recent work with rich previews.
                </Text>
              </Box>
            </>
          ) : (
            <>
              <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={2}>Your Posted Projects</Heading>
                <Text color="gray.600">
                  Track bids, project status, and milestone progress.
                </Text>
              </Box>

              <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={2}>Top Matched Freelancers</Heading>
                <Text color="gray.600">
                  Freelancers matched by AI to your project requirements.
                </Text>
              </Box>
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Dashboard;
