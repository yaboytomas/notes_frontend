import {
  Box,
  Button,
  Field,
  Input,
  Heading,
  VStack,
  Container,
  Card,
  Text,
  Link as ChakraLink,
  Flex
} from '@chakra-ui/react';
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('/users/login', formData);
      login(res.data.user, res.data.token);
      alert('Welcome back! Logged in successfully! 🎉');
      navigate('/');
    } catch (err) {
      alert(`❌ Login failed: ${err.response?.data?.message || 'Invalid credentials'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      minH="calc(100vh - 80px)" 
      bg="gray.50" 
      py={{ base: 8, md: 16 }}
      px={4}
    >
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={3} textAlign="center">
            <Heading 
              size={{ base: "lg", md: "xl" }} 
              color="gray.800"
              fontWeight="bold"
            >
              Welcome Back! 👋
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Sign in to your account to continue
            </Text>
          </VStack>

          {/* Login Card */}
          <Card.Root 
            w="full" 
            bg="white" 
            boxShadow="xl"
            borderRadius="xl"
            border="1px"
            borderColor="gray.200"
          >
            <Card.Body p={{ base: 6, md: 8 }}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <Field.Root required>
                    <Field.Label 
                      color="gray.700" 
                      fontWeight="semibold"
                      fontSize="sm"
                    >
                      Email Address
                    </Field.Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      size="lg"
                      bg="white"
                      border="2px"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.300" }}
                      _focus={{ 
                        borderColor: "blue.500", 
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" 
                      }}
                      borderRadius="lg"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label 
                      color="gray.700" 
                      fontWeight="semibold"
                      fontSize="sm"
                    >
                      Password
                    </Field.Label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      size="lg"
                      bg="white"
                      border="2px"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.300" }}
                      _focus={{ 
                        borderColor: "blue.500", 
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" 
                      }}
                      borderRadius="lg"
                    />
                  </Field.Root>

                  <Button 
                    type="submit" 
                    width="full"
                    size="lg"
                    bg="blue.600"
                    color="white"
                    _hover={{ bg: "blue.700", transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    borderRadius="lg"
                    fontWeight="semibold"
                    boxShadow="lg"
                    isLoading={isLoading}
                    loadingText="Signing In..."
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>

          {/* Sign Up Link */}
          <Flex 
            direction={{ base: "column", sm: "row" }} 
            align="center" 
            gap={2}
            textAlign="center"
          >
            <Text color="gray.600" fontSize="sm">
              Don't have an account?
            </Text>
            <ChakraLink 
              as={Link} 
              to="/register"
              color="blue.600"
              fontWeight="semibold"
              _hover={{ color: "blue.800", textDecoration: "underline" }}
              fontSize="sm"
            >
              Create one here →
            </ChakraLink>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login;
