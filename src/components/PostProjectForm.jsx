import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

const PostProjectForm = ({ onProjectPosted, userId }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    skills: "", // New field for input
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/projects",
        {
          ...form,
          skills: form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill !== ""),
          postedBy: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onProjectPosted(res.data.project);
      setForm({
        title: "",
        description: "",
        budget: "",
        deadline: "",
        skills: "",
      });
    } catch (err) {
      alert(
        "Error posting project: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input name="title" value={form.title} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Budget</FormLabel>
          <Input
            type="number"
            name="budget"
            value={form.budget}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Deadline</FormLabel>
          <Input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Skills (comma-separated)</FormLabel>
          <Input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, MongoDB"
          />
        </FormControl>

        <Button colorScheme="teal" type="submit">
          Post Project
        </Button>
      </Stack>
    </Box>
  );
};

export default PostProjectForm;
