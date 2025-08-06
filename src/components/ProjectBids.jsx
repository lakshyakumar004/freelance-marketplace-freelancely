import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Spinner,
  VStack,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const ProjectBids = ({ projectId, refreshTrigger }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/bids/${projectId}/bids`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBids(res.data.bids);
    } catch (err) {
      console.error("Failed to fetch bids", err);
      toast({
        title: "Error",
        description: "Failed to fetch bids",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [projectId, refreshTrigger]);

  const handleStatusUpdate = async (bidId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bids/${bidId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast({
        title: `Bid ${status}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchBids();
    } catch (err) {
      console.error(`Failed to ${status} bid`, err);
      toast({
        title: "Error",
        description: `Could not ${status} bid`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner size="sm" />;

  if (bids.length === 0)
    return <Text fontStyle="italic" color="gray.500">No bids yet.</Text>;

  return (
    <VStack align="start" spacing={3} mt={3}>
      {bids.map((bid) => (
        <Box
          key={bid._id}
          border="1px solid #ccc"
          borderRadius="md"
          p={3}
          w="100%"
        >
          <Text><strong>Freelancer:</strong> {bid.freelancer?.username || "Unknown"} ({bid.freelancer?.experienceLevel || "N/A"})</Text>
          <Text><strong>Amount:</strong> ₹{bid.amount}</Text>
          <Text><strong>Comment:</strong> {bid.comment || "No comment"}</Text>
          <Text>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  bid.status === "accepted"
                    ? "green"
                    : bid.status === "declined"
                    ? "red"
                    : "orange",
                fontWeight: 600,
              }}
            >
              {bid.status}
            </span>
          </Text>

          {bid.status === "pending" && (
            <HStack mt={2}>
              <Button
                size="xs"
                colorScheme="green"
                onClick={() => handleStatusUpdate(bid._id, "accepted")}
              >
                Accept
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => handleStatusUpdate(bid._id, "declined")}
              >
                Decline
              </Button>
            </HStack>
          )}
        </Box>
      ))}
    </VStack>
  );
};

export default ProjectBids;
