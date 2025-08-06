import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  useColorModeValue,
  Spinner,
  Button,
  Stack,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";

import socket from "../socket"; // Adjust if backend is hosted elsewhere

const AvailableProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const cardBg = useColorModeValue("white", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter out projects that already have an accepted bid
      const filtered = response.data.projects.filter(project => {
        const hasAcceptedBid = project.bids?.some(bid => bid.status === "accepted");
        return !hasAcceptedBid;
      });

      setProjects(filtered);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Listen for new projects
    socket.on("newProjectPosted", (newProject) => {
      setProjects((prev) => {
        const alreadyExists = prev.some(p => p._id === newProject._id);
        return alreadyExists ? prev : [...prev, newProject];
      });
    });

    // Listen for project deletions or accepted bids
    socket.on("projectUpdated", ({ projectId }) => {
      setProjects((prev) => prev.filter(p => p._id !== projectId));
    });

    return () => {
      socket.off("newProjectPosted");
      socket.off("projectUpdated");
    };
  }, []);

  const handleBidSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/bids",
        {
          amount,
          comment,
          projectId: selectedProject._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Bid placed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setAmount("");
      setComment("");
      onClose();
    } catch (err) {
      console.error("Bid failed:", err);
      toast({
        title: "Error",
        description: "Could not place bid.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Available Projects
      </Heading>
      <VStack spacing={6} align="stretch">
        {projects.length === 0 ? (
          <Text>No projects available at the moment.</Text>
        ) : (
          projects.map((project) => (
            <Box
              key={project._id}
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="md"
              transition="0.3s"
              _hover={{ boxShadow: "xl" }}
            >
              <Stack spacing={3}>
                <Heading size="md">{project.title}</Heading>
                <Text color="gray.600">{project.description}</Text>
                <Stack direction="row" wrap="wrap">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} colorScheme="teal">
                      {skill}
                    </Badge>
                  ))}
                </Stack>
                <Text>
                  <strong>Posted By:</strong> {project.postedBy?.fullName || "Unknown"}
                </Text>
                <Text>
                  <strong>Budget:</strong> ₹{project.budget}
                </Text>
                <Text>
                  <strong>Deadline:</strong>{" "}
                  {new Date(project.deadline).toLocaleDateString()}
                </Text>
                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project);
                    onOpen();
                  }}
                >
                  Bid Now
                </Button>
              </Stack>
            </Box>
          ))
        )}
      </VStack>

      {/* Bid Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Place Your Bid</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter bid amount in ₹"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              mb={4}
            />
            <Textarea
              placeholder="Add a comment or proposal message"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleBidSubmit}>
              Submit Bid
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AvailableProjects;
