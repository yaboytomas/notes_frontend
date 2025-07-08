import { Box, Flex, Button, Text, Container, HStack, Show, Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, Avatar } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Add confirmation dialog
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        // Call the signout endpoint
        await axios.post('/users/signout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Error signing out from server:', error);
        // Continue with logout even if server call fails
      }
      
      logout();
      alert('👋 You have been signed out successfully!');
      navigate('/login');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <Box bg="blue.600" boxShadow="lg" position="sticky" top="0" zIndex="sticky">
      <Container maxW="7xl">
        <Flex justify="space-between" align="center" py={4}>
          {/* Logo */}
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="white"
            as={Link}
            to="/"
            _hover={{ color: "blue.200" }}
            transition="color 0.2s"
          >
            📝 Notes App
          </Text>

          {/* Desktop Menu */}
          <Show above="md">
            <HStack gap={4}>
              {user ? (
                <>
                  <Text color="blue.100" fontSize="sm">
                    Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!
                  </Text>
                  <Menu.Root>
                    <MenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        color="white"
                        _hover={{ bg: "blue.500" }}
                        gap={2}
                      >
                        <Avatar 
                          name={user.name || user.email} 
                          size="sm"
                          bg="blue.300"
                          color="blue.800"
                        />
                        <Text fontSize="sm">
                          {user.name || user.email?.split('@')[0]}
                        </Text>
                      </Button>
                    </MenuTrigger>
                    <MenuContent 
                      bg="white" 
                      boxShadow="lg" 
                      borderRadius="md"
                      minW="200px"
                    >
                      <MenuItem 
                        color="gray.600" 
                        _hover={{ bg: "gray.50" }}
                        cursor="default"
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {user.email}
                        </Text>
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem 
                        color="red.600" 
                        _hover={{ bg: "red.50" }}
                        onClick={handleLogout}
                      >
                        🚪 Sign Out
                      </MenuItem>
                    </MenuContent>
                  </Menu.Root>
                </>
              ) : (
                <>
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="ghost" 
                    color="white"
                    _hover={{ bg: "blue.500" }}
                  >
                    Login
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register" 
                    bg="white" 
                    color="blue.600"
                    _hover={{ bg: "blue.50" }}
                  >
                    Register
                  </Button>
                </>
              )}
            </HStack>
          </Show>

          {/* Mobile Menu Button */}
          <Show below="md">
            <Button
              variant="ghost"
              color="white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              fontSize="lg"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </Button>
          </Show>
        </Flex>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <Show below="md">
            <Box pb={4}>
              <Flex direction="column" gap={3}>
                {user ? (
                  <>
                    <Box textAlign="center" py={2}>
                      <Avatar 
                        name={user.name || user.email} 
                        size="md"
                        bg="blue.300"
                        color="blue.800"
                        mb={2}
                      />
                      <Text color="blue.100" fontSize="sm" fontWeight="medium">
                        {user.name || user.email?.split('@')[0]}
                      </Text>
                      <Text color="blue.200" fontSize="xs">
                        {user.email}
                      </Text>
                    </Box>
                    <Button 
                      colorScheme="red" 
                      variant="outline" 
                      onClick={handleLogout}
                      color="white"
                      borderColor="red.300"
                      _hover={{ bg: "red.500", borderColor: "red.500" }}
                    >
                      🚪 Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      as={Link} 
                      to="/login" 
                      variant="ghost" 
                      color="white"
                      _hover={{ bg: "blue.500" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                    <Button 
                      as={Link} 
                      to="/register" 
                      bg="white" 
                      color="blue.600"
                      _hover={{ bg: "blue.50" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Flex>
            </Box>
          </Show>
        )}
      </Container>
    </Box>
  );
};

export default Navbar;
