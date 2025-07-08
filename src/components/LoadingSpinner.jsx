import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';

const LoadingSpinner = ({ message = "Loading...", size = "lg" }) => {
  return (
    <Flex 
      justify="center" 
      align="center" 
      minH="200px"
      w="full"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="3px"
          speed="0.8s"
          emptyColor="gray.200"
          color="blue.500"
          size={size}
        />
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Flex>
  );
};

export default LoadingSpinner; 