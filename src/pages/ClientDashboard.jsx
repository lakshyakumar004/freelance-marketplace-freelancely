import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  useColorModeValue,
  Button,
  HStack,
  Icon,
  Spinner,
  Collapse,
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
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { ChatIcon } from "@chakra-ui/icons";
import PostProjectForm from "../components/PostProjectForm";
import ProjectBids from "../components/ProjectBids";
import axios from "axios";
import socket from "../socket";

const ClientDashboard = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshMap, setRefreshMap] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProjects(parsedUser._id);
    }
  }, [navigate]);

  const fetchProjects = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/projects/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("newBid", ({ projectId }) => {
      setRefreshMap((prev) => ({
        ...prev,
        [projectId]: Date.now(),
      }));
    });

    return () => {
      socket.off("newBid");
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((prev) => prev.filter((project) => project._id !== projectId));
    } catch (err) {
      alert("Failed to delete project: " + (err.response?.data?.message || err.message));
    }
  };

  if (!user) return null;

  return (
    <Box minH="100vh" bg={bg}>
      {/* Navbar */}
      <Flex justify="space-between" align="center" px={8} py={5} bg="teal.500" color="white" boxShadow="md">
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
            <MenuButton as={Avatar} size="sm" cursor="pointer" />
            <MenuList bg="white" color="black">
              <MenuItem onClick={onOpen}>View Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile Info</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="400px" overflowY="auto" px={2}>
            <Text mb={2}><strong>Full Name:</strong> {user.fullName || "Not provided"}</Text>
            <Text mb={2}><strong>Email:</strong> {user.email || "Not provided"}</Text>
            <Text mb={2}><strong>Account Type:</strong> {user.accountType}</Text>
            <Text mb={2}><strong>Company:</strong> {user.company || "Not provided"}</Text>
            <Text mb={2}><strong>Project Description:</strong> {user.projectDescription || "Not provided"}</Text>
            <Text mb={2}><strong>Budget:</strong> {user.budget ? `₹${user.budget}` : "Not provided"}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Main Content */}
      <Box px={6} py={10}>
        <VStack spacing={6} align="stretch">
          <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Post a New Project</Heading>
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                leftIcon={<Icon as={showForm ? FiMinus : FiPlus} />}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Hide Form" : "Show Form"}
              </Button>
            </Flex>

            <Collapse in={showForm} animateOpacity>
              <PostProjectForm userId={user._id} onProjectPosted={(newProject) => {
                setProjects((prev) => [newProject, ...prev]);
                setShowForm(false);
              }} />
            </Collapse>

            <Heading size="sm" mt={8} mb={2}>Your Projects</Heading>
            {loading ? (
              <Spinner />
            ) : projects.length === 0 ? (
              <Text color="gray.500">No projects posted yet.</Text>
            ) : (
              projects.map((project) => (
                <Box key={project._id} p={4} mt={3} borderWidth="1px" borderRadius="lg" bg={useColorModeValue("gray.100", "gray.700")}>
                  <Flex justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontWeight="bold">{project.title}</Text>
                      <Text fontSize="sm" color="gray.600">{project.description}</Text>
                      <Text fontSize="sm">Budget: ₹{project.budget}</Text>
                      <Text fontSize="sm">Deadline: {new Date(project.deadline).toDateString()}</Text>
                      {project.skills?.length > 0 && (
                        <Text fontSize="sm" mt={2} color="gray.500">
                          Skills: {project.skills.join(", ")}
                        </Text>
                      )}
                      <Box mt={4}>
                        <Text fontWeight="semibold" mb={2}>Bids:</Text>
                        <ProjectBids projectId={project._id} refreshTrigger={refreshMap[project._id]} />
                      </Box>
                    </Box>
                    <Button
                      onClick={() => handleDeleteProject(project._id)}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      ml={2}
                    >
                      <Icon as={FiTrash2} />
                    </Button>
                  </Flex>
                </Box>
              ))
            )}
          </Box>

          <Box p={6} bg={cardBg} borderRadius="xl" boxShadow="md">
            <Heading size="md" mb={2}>Top Matched Freelancers</Heading>
            <Text color="gray.600">Freelancers matched by AI to your posted project requirements.</Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ClientDashboard;
