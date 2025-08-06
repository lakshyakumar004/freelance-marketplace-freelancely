import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const AuthLayout = ({ title, children }) => {
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box p={8} maxW="400px" w="full" bg="white" boxShadow="lg" borderRadius="xl">
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center">{title}</Heading>
          {children}
        </VStack>
      </Box>
    </Box>
  );
};

export default AuthLayout;
