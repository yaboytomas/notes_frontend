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

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validation checks
    if (!formData.name.trim()) {
      alert('❌ Please enter your full name!');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('❌ Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      alert('❌ Password must be at least 6 characters long!');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      login(res.data.user, res.data.token);
      alert('🎉 Welcome! Account created successfully!');
      navigate('/');
    } catch (err) {
      alert(`❌ Registration failed: ${err.response?.data?.message || 'Unknown error'}`);
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
              Join Notes App! 🚀
            </Heading>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Create your account to start organizing your thoughts
            </Text>
          </VStack>

          {/* Register Card */}
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
                      Full Name
                    </Field.Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
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
                      placeholder="Choose a strong password (min 6 chars)"
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
                      Confirm Password
                    </Field.Label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
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
                    bg="green.600"
                    color="white"
                    _hover={{ bg: "green.700", transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    borderRadius="lg"
                    fontWeight="semibold"
                    boxShadow="lg"
                    isLoading={isLoading}
                    loadingText="Creating Account..."
                  >
                    Create Account
                  </Button>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>

          {/* Sign In Link */}
          <Flex 
            direction={{ base: "column", sm: "row" }} 
            align="center" 
            gap={2}
            textAlign="center"
          >
            <Text color="gray.600" fontSize="sm">
              Already have an account?
            </Text>
            <ChakraLink 
              as={Link} 
              to="/login"
              color="blue.600"
              fontWeight="semibold"
              _hover={{ color: "blue.800", textDecoration: "underline" }}
              fontSize="sm"
            >
              Sign in here →
            </ChakraLink>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Register;
