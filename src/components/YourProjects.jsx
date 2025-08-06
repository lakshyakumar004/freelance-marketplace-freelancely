import { Box, Text, VStack, Spinner, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";

const YourProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/bids/freelancer/accepted", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.bids || []);
    } catch (err) {
      console.error("Error fetching your projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const currentUser = JSON.parse(localStorage.getItem("user"));

    socket.on("bidAccepted", async ({ freelancerId, projectId }) => {
      console.log("Received bidAccepted:", freelancerId, projectId);
      if (String(currentUser?._id) === String(freelancerId)) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:5000/api/bids/freelancer/accepted", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProjects(res.data.bids || []);
        } catch (err) {
          console.error("Real-time update failed:", err);
        }
      }
    });

    return () => {
      socket.off("bidAccepted");
    };
  }, []);

  if (loading) return <Spinner />;
  if (projects.length === 0) return <Text>No accepted projects yet.</Text>;

  return (
    <VStack align="start" spacing={4} w="100%">
      {projects.map(({ _id, project }) => {
        if (!project) return null; // 🛡️ prevent crash if project is null

        return (
          <Box key={_id} borderWidth="1px" p={4} borderRadius="md" w="100%">
            <Heading size="sm">{project.title || "Untitled Project"}</Heading>
            <Text mt={2}>{project.description || "No description provided."}</Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Budget: ₹{project.budget ?? "N/A"}
            </Text>
          </Box>
        );
      })}
    </VStack>
  );
};

export default YourProjects;
