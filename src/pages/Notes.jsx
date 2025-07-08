import {
  Box,
  Button,
  VStack,
  Text,
  Heading,
  HStack,
  Container,
  Card,
  Grid,
  Flex,
  Badge,
  Textarea,
  EmptyState,
  Show
} from '@chakra-ui/react';
import { useState, useEffect, useContext, useCallback } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Notes = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching notes...');
      const res = await axios.get('/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Raw backend response:', res.data);
      
      // Handle different possible response structures
      let notesData = [];
      if (Array.isArray(res.data)) {
        notesData = res.data;
      } else if (res.data.notes && Array.isArray(res.data.notes)) {
        notesData = res.data.notes;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        notesData = res.data.data;
      } else {
        console.error('Unexpected response structure:', res.data);
        notesData = [];
      }
      
      // Filter out invalid entries (be more permissive)
      const validNotes = notesData.filter(note => note && note._id);
      
      // Debug: log the note structure
      console.log('Processed notes:', validNotes);
      if (validNotes.length > 0) {
        console.log('Sample note structure:', validNotes[0]);
        console.log('Note fields present:', Object.keys(validNotes[0]));
      }
      
      setNotes(validNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401) {
        alert('🔐 Your session has expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        alert('❌ Failed to load notes. Please try refreshing the page.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, navigate]);

  const createNote = async () => {
    if (!text.trim()) return;
    setIsCreating(true);
    
    // Split the text into title and content
    const lines = text.trim().split('\n');
    const title = lines[0] || 'Untitled Note';
    
    // If there's only one line, use it as both title and content
    // If there are multiple lines, title is first line, content is everything
    const content = lines.length > 1 ? text.trim() : lines[0] || 'Untitled Note';
    
    try {
      console.log('Creating note with:', { title, content });
      
      const res = await axios.post(
        '/notes',
        { 
          title: title.slice(0, 100), // Limit title length
          content: content 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('Backend response:', res.data);
      
      // Check if the backend returned a note
      if (res.data && res.data._id) {
        // The backend might return the note directly or in a 'note' property
        const newNote = res.data.note || res.data;
        console.log('New note received:', newNote);
        
        // Add to the beginning of the list
        setNotes([newNote, ...notes]);
        setText('');
        alert('✅ Note added successfully!');
      } else {
        console.error('Unexpected response structure:', res.data);
        alert('✅ Note created! Refreshing to load it...');
        // Refresh to get the latest data from backend
        fetchNotes();
        setText('');
      }
    } catch (err) {
      console.error('Error creating note:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401) {
        alert('🔐 Your session has expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (err.response?.status === 400) {
        alert('❌ Invalid note data. Please check your input.');
      } else {
        alert('❌ Failed to add note. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const updateNote = async (id, content) => {
    if (!id || !content.trim()) {
      alert('❌ Invalid note data');
      return;
    }
    
    setIsUpdating(true);
    
    const lines = content.trim().split('\n');
    const title = lines[0] || 'Untitled Note';
    const finalContent = lines.length > 1 ? content.trim() : lines[0] || 'Untitled Note';
    
    try {
      console.log('Updating note with:', { id, title, content: finalContent });
      
      const res = await axios.put(`/notes/${id}`, {
        title: title.slice(0, 100), // Limit title length
        content: finalContent
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Update response:', res.data);
      
      // Handle different response structures
      if (res.data && res.data._id) {
        const updatedNote = res.data.note || res.data;
        console.log('Updated note received:', updatedNote);
        
        setNotes(notes.map(note => 
          note._id === id ? updatedNote : note
        ));
        setEditingNote(null);
        setEditText('');
        alert('✅ Note updated successfully!');
      } else {
        console.error('Unexpected update response:', res.data);
        alert('✅ Note updated! Refreshing to load changes...');
        fetchNotes();
        setEditingNote(null);
        setEditText('');
      }
    } catch (err) {
      console.error('Error updating note:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401) {
        alert('🔐 Your session has expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (err.response?.status === 404) {
        alert('❌ Note not found. It may have been deleted.');
        fetchNotes();
        setEditingNote(null);
        setEditText('');
      } else {
        alert('❌ Failed to update note');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = (note) => {
    setEditingNote(note._id);
    // If title and content are different, combine them for editing
    if (note.title && note.content && note.title !== note.content) {
      setEditText(`${note.title}\n${note.content}`);
    } else {
      setEditText(note.content || note.title || '');
    }
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditText('');
  };

  const deleteNote = async (id) => {
    if (!id) {
      alert('❌ Invalid note ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out the deleted note from state
      setNotes(notes.filter((note) => validateNote(note) && note._id !== id));
      alert('🗑️ Note deleted successfully!');
    } catch (err) {
      console.error('Error deleting note:', err);
      if (err.response?.status === 404) {
        alert('❌ Note not found. It may have already been deleted.');
        // Refresh to sync with backend
        fetchNotes();
      } else if (err.response?.status === 401) {
        alert('❌ Authentication error. Please log in again.');
        logout();
      } else {
        alert('❌ Failed to delete note');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      createNote();
    }
  };

  const handleEditKeyPress = (e, noteId) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      updateNote(noteId, editText);
    }
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      // Focus on note input with Ctrl/Cmd + N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const textarea = document.querySelector('textarea[placeholder*="What\'s on your mind"]');
        if (textarea) {
          textarea.focus();
        }
      }
      
      // Refresh notes with Ctrl/Cmd + R (override default)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !isLoading) {
        e.preventDefault();
        fetchNotes();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, [fetchNotes, isLoading]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  // Helper function to validate note structure matches backend schema
  const validateNote = (note) => {
    return (
      note &&
      typeof note === 'object' &&
      note._id &&
      (typeof note.title === 'string' || note.title === undefined) &&
      (typeof note.content === 'string' || note.content === undefined)
    );
  };



  return (
    <Box bg="gray.50" minH="calc(100vh - 80px)" py={{ base: 6, md: 8 }}>
      <Container maxW="6xl">
        <VStack spacing={8}>
          {/* Header Section */}
          <Box textAlign="center">
            <Flex justify="space-between" align="center" mb={4}>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchNotes}
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Refreshing..."
                display={{ base: "none", md: "flex" }}
              >
                🔄 Refresh
              </Button>
              <Heading 
                size={{ base: "lg", md: "xl" }} 
                color="gray.800"
              >
                📝 Your Notes
              </Heading>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    try {
                      await axios.post('/users/signout', {}, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    } catch (error) {
                      console.error('Error signing out from server:', error);
                    }
                    
                    logout();
                    alert('👋 You have been signed out successfully!');
                    navigate('/login');
                  }
                }}
                display={{ base: "none", md: "flex" }}
              >
                🚪 Sign Out
                            </Button>
            </Flex>
            
            {/* Mobile Refresh Button */}
            <Show below="md">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchNotes}
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Refreshing..."
                mt={2}
              >
                🔄 Refresh Notes
              </Button>
            </Show>

            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Capture your thoughts and ideas
            </Text>
            <Flex justify="center" align="center" gap={3} mt={2}>
              <Badge 
                colorScheme="blue" 
                fontSize="sm" 
                px={3}
                py={1}
                borderRadius="full"
              >
                {Array.isArray(notes) ? notes.length : 0} {(Array.isArray(notes) && notes.length === 1) ? 'note' : 'notes'}
              </Badge>
              {token && (
                <Badge 
                  colorScheme="green" 
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  🟢 Connected
                </Badge>
              )}
            </Flex>
          </Box>

          {/* Add Note Section */}
          <Card.Root 
            w="full" 
            maxW="2xl" 
            bg="white" 
            boxShadow="lg"
            borderRadius="xl"
            border="1px"
            borderColor="gray.200"
          >
            <Card.Body p={{ base: 6, md: 8 }}>
              <VStack spacing={4}>
                <Text fontWeight="semibold" color="gray.700" alignSelf="start">
                  ✍️ Add a new note
                </Text>
                <Textarea
                  placeholder="What's on your mind? First line becomes the title, rest is content..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  minH="120px"
                  bg="gray.50"
                  border="2px"
                  borderColor="gray.200"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{ 
                    borderColor: "blue.500", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                    bg: "white"
                  }}
                  borderRadius="lg"
                  resize="vertical"
                />
                <Flex 
                  justify="space-between" 
                  align="center" 
                  w="full"
                  flexDirection={{ base: "column", sm: "row" }}
                  gap={3}
                >
                  <Text fontSize="sm" color="gray.500">
                    💡 Tips: First line = title, rest = content | Ctrl+Enter to save, Ctrl+N to focus, Ctrl+R to refresh
                  </Text>
                  <Button
                    onClick={createNote}
                    isDisabled={!text.trim()}
                    isLoading={isCreating}
                    loadingText="Adding..."
                    bg="blue.600"
                    color="white"
                    _hover={{ bg: "blue.700", transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    borderRadius="lg"
                    fontWeight="semibold"
                    boxShadow="md"
                    px={8}
                  >
                    ➕ Add Note
                  </Button>
                </Flex>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Notes Grid */}
          {isLoading ? (
            <LoadingSpinner message="Loading your notes..." />
          ) : !Array.isArray(notes) || notes.length === 0 ? (
            <EmptyState.Root maxW="md" textAlign="center">
              <EmptyState.Content>
                <Text fontSize="6xl" mb={4}>📝</Text>
                <EmptyState.Title fontSize="lg" color="gray.700">
                  No notes yet
                </EmptyState.Title>
                <EmptyState.Description color="gray.500">
                  Start by adding your first note above. First line becomes the title, rest is your content!
                </EmptyState.Description>
              </EmptyState.Content>
            </EmptyState.Root>
          ) : (
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(2, 1fr)", 
                lg: "repeat(3, 1fr)" 
              }}
              gap={6}
              w="full"
            >
                            {(Array.isArray(notes) ? notes : []).filter(validateNote).map((note, index) => (
                <Card.Root 
                  key={note._id}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="md"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ 
                    boxShadow: "lg", 
                    transform: "translateY(-2px)",
                    borderColor: "blue.300" 
                  }}
                  transition="all 0.2s"
                  h="fit-content"
                >
                  <Card.Body p={6}>
                    <VStack align="start" spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Badge 
                          colorScheme="purple" 
                          fontSize="xs"
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          #{index + 1}
                        </Badge>
                                                 <Text fontSize="xs" color="gray.500">
                           {formatDate(note.timestamp || note.createdAt)}
                         </Text>
                      </HStack>
                      
                      {editingNote === note._id ? (
                        <VStack spacing={3} w="full">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, note._id)}
                            minH="100px"
                            bg="gray.50"
                            border="2px"
                            borderColor="blue.200"
                            _focus={{ 
                              borderColor: "blue.500", 
                              boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" 
                            }}
                            borderRadius="lg"
                            placeholder="Update your note... (Ctrl+Enter to save, Esc to cancel)"
                          />
                                                     <VStack spacing={2} w="full">
                             <Text fontSize="xs" color="gray.500" alignSelf="start">
                               💡 Tip: Ctrl+Enter to save, Esc to cancel
                             </Text>
                             <HStack spacing={2} w="full" justify="end">
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={cancelEditing}
                                 colorScheme="gray"
                               >
                                 Cancel
                               </Button>
                               <Button
                                 size="sm"
                                 onClick={() => updateNote(note._id, editText)}
                                 colorScheme="blue"
                                 isDisabled={!editText.trim()}
                                 isLoading={isUpdating}
                                 loadingText="Saving..."
                               >
                                 💾 Save
                               </Button>
                             </HStack>
                           </VStack>
                        </VStack>
                      ) : (
                        <>
                          {/* Display title if it exists and is different from content */}
                          {note.title && note.title !== note.content && (
                            <Text 
                              fontWeight="bold"
                              fontSize="md"
                              color="gray.800"
                              mb={2}
                              lineHeight="shorter"
                            >
                              {note.title}
                            </Text>
                          )}
                          
                          <Text 
                            color="gray.700" 
                            lineHeight="tall"
                            whiteSpace="pre-wrap"
                            wordBreak="break-word"
                          >
                            {note.content || note.title || 'No content'}
                          </Text>
                          
                          <HStack spacing={2} alignSelf="end">
                            <Button
                              onClick={() => startEditing(note)}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              _hover={{ bg: "blue.50", transform: "scale(1.05)" }}
                              _active={{ transform: "scale(0.95)" }}
                              transition="all 0.2s"
                              borderRadius="lg"
                              fontWeight="medium"
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              onClick={() => deleteNote(note._id)}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              _hover={{ bg: "red.50", transform: "scale(1.05)" }}
                              _active={{ transform: "scale(0.95)" }}
                              transition="all 0.2s"
                              borderRadius="lg"
                              fontWeight="medium"
                            >
                              🗑️ Delete
                            </Button>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Notes;
