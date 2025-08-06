import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  Link,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/dashboard");
  }
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);

      // Store token and user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast({
        title: "Login successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed.",
        description: error.response?.data?.message || "Something went wrong.",
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
        maxW="900px"
        boxShadow="2xl"
        borderRadius="xl"
        overflow="hidden"
        bg={formBg}
      >
        {/* Left Info Banner */}
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
            Welcome Back
          </Heading>
          <Text fontSize="lg" textAlign="center">
            Log in to your Freelancely account and continue collaborating, creating, and hiring talent.
          </Text>
        </Flex>

        {/* Right Form */}
        <Box flex="1" p={10}>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">
              Log In
            </Heading>

            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </FormControl>

            <Button
              colorScheme="teal"
              size="lg"
              w="full"
              onClick={handleLogin}
            >
              Log In
            </Button>

            <Text fontSize="sm" textAlign="center">
              Don’t have an account?{" "}
              <Link href="/signup" color="teal.500">
                Sign up here
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
