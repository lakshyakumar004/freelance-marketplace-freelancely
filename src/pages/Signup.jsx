import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  Text,
  RadioGroup,
  Radio,
  Stack,
  useColorModeValue,
  Link,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "freelancer",
    username: "",
    skills: "",
    experience: "",
    bio: "",
    portfolio: "",
    hourlyRate: "",
    company: "",
    projectDesc: "",
    budget: ""
  });

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType === "freelancer" ? "Freelancer" : "Client",
      };

      if (formData.accountType === "freelancer") {
        payload.username = formData.username;
        payload.skills = formData.skills.split(",").map(skill => skill.trim());
        payload.experienceLevel = formData.experience;
        payload.bio = formData.bio;
        payload.portfolioUrl = formData.portfolio;
        payload.hourlyRate = parseFloat(formData.hourlyRate);
      } else {
        payload.company = formData.company;
        payload.projectDescription = formData.projectDesc;
        payload.budget = parseFloat(formData.budget);
      }

      const res = await axios.post("http://localhost:5000/api/auth/signup", payload);

      toast({
        title: "Signup successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      console.log(res.data);
      // Redirect or clear form here if needed
    } catch (error) {
      toast({
        title: "Signup failed.",
        description: error.response?.data?.message || "Server error",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const formBg = useColorModeValue("white", "gray.800");

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100">
      <Flex
        w="full"
        maxW="1100px"
        boxShadow="2xl"
        borderRadius="xl"
        overflow="hidden"
        bg={formBg}
      >
        {/* Left Banner Section */}
        <Flex
          flex="1"
          bg="teal.500"
          color="white"
          direction="column"
          align="center"
          justify="center"
          px={8}
          py={12}
          display={useBreakpointValue({ base: "none", md: "flex" })}
        >
          <Heading size="lg" mb={4}>
            Welcome to Freelancely
          </Heading>
          <Text fontSize="lg" textAlign="center">
            Join a global community of freelancers and clients. Sign up and showcase your skills or find the right talent today!
          </Text>
        </Flex>

        {/* Right Form Section */}
        <Box flex="1" p={10}>
          <VStack spacing={4} align="stretch">
            <Heading size="lg" textAlign="center">
              Create Your Account
            </Heading>

            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input name="name" value={formData.name} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input name="password" type="password" value={formData.password} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Account Type</FormLabel>
              <RadioGroup
                value={formData.accountType}
                onChange={(val) => setFormData((prev) => ({ ...prev, accountType: val }))}
              >
                <Stack direction="row">
                  <Radio value="freelancer">Freelancer</Radio>
                  <Radio value="client">Client</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {formData.accountType === "freelancer" && (
              <>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input name="username" value={formData.username} onChange={handleChange} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Skills (comma separated)</FormLabel>
                  <Input name="skills" value={formData.skills} onChange={handleChange} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Experience Level</FormLabel>
                  <Select name="experience" value={formData.experience} onChange={handleChange}>
                    <option value="">Select...</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea name="bio" value={formData.bio} onChange={handleChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Portfolio URL</FormLabel>
                  <Input name="portfolio" value={formData.portfolio} onChange={handleChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Hourly Rate ($)</FormLabel>
                  <Input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} />
                </FormControl>
              </>
            )}

            {formData.accountType === "client" && (
              <>
                <FormControl>
                  <FormLabel>Company</FormLabel>
                  <Input name="company" value={formData.company} onChange={handleChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Project Description</FormLabel>
                  <Textarea name="projectDesc" value={formData.projectDesc} onChange={handleChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Budget ($)</FormLabel>
                  <Input type="number" name="budget" value={formData.budget} onChange={handleChange} />
                </FormControl>
              </>
            )}

            <Button
              colorScheme="teal"
              size="lg"
              w="full"
              mt={4}
              onClick={handleSignup}
            >
              Sign Up
            </Button>

            <Text fontSize="sm" textAlign="center">
              Already have an account?{" "}
              <Link color="teal.500" href="/login">
                Log in here
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Signup;
