import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Search, Book, GraduationCap, Newspaper, Heart, Brain, Code, ArrowLeft, Eye, ExternalLink, Download } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  image_url: string;
  download_url: string;
  view_online_url?: string;
  pages: number;
  file_size: string;
  language: string;
  publication_year: number;
  rating: number;
  tags: string[];
}

interface BookCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bookCount: number;
}

export const Library: React.FC = () => {
  const { user, signOut } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'books'>('main');
  const [selectedBookCategory, setSelectedBookCategory] = useState<string>('');

  // Book categories data
  const bookCategories: BookCategory[] = [
    {
      id: 'aptitude',
      name: 'Aptitude Books',
      description: 'Books for competitive exams and aptitude tests',
      icon: <Brain className="h-8 w-8" />,
      color: 'bg-blue-500',
      bookCount: 25
    },
    {
      id: 'engineering',
      name: 'Engineering Books',
      description: 'Technical books for engineering students',
      icon: <GraduationCap className="h-8 w-8" />,
      color: 'bg-green-500',
      bookCount: 42
    },
    {
      id: 'programming',
      name: 'Programming Books',
      description: 'Coding and software development resources',
      icon: <Code className="h-8 w-8" />,
      color: 'bg-purple-500',
      bookCount: 38
    },
    {
      id: 'magazines',
      name: 'Magazines',
      description: 'Latest magazines and periodicals',
      icon: <Newspaper className="h-8 w-8" />,
      color: 'bg-orange-500',
      bookCount: 15
    },
    {
      id: 'novels',
      name: 'Novels',
      description: 'Fiction and literature collection',
      icon: <Heart className="h-8 w-8" />,
      color: 'bg-pink-500',
      bookCount: 60
    },
    {
      id: 'general',
      name: 'General Books',
      description: 'Miscellaneous books and references',
      icon: <Book className="h-8 w-8" />,
      color: 'bg-gray-500',
      bookCount: 30
    }
  ];

  // Sample books data (in real app, this would come from API/database)
  const sampleBooks: Book[] = [
    {
      id: '1',
      title: 'Quantitative Aptitude for Competitive Examinations',
      author: 'R.S. Aggarwal',
      description: 'A comprehensive book for quantitative aptitude preparation.',
      category: 'aptitude',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      download_url: '#',
      view_online_url: '#',
      pages: 456,
      file_size: '15.2 MB',
      language: 'English',
      publication_year: 2023,
      rating: 4.5,
      tags: ['aptitude', 'mathematics', 'competitive']
    },
    {
      id: '2',
      title: 'Data Structures and Algorithms',
      author: 'Thomas H. Cormen',
      description: 'Introduction to algorithms and data structures.',
      category: 'programming',
      image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=400&fit=crop',
      download_url: '#',
      view_online_url: '#',
      pages: 1312,
      file_size: '25.8 MB',
      language: 'English',
      publication_year: 2022,
      rating: 4.8,
      tags: ['algorithms', 'programming', 'computer science']
    },
    {
      id: '3',
      title: 'Engineering Mathematics',
      author: 'B.S. Grewal',
      description: 'Higher engineering mathematics for all branches.',
      category: 'engineering',
      image_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=400&fit=crop',
      download_url: '#',
      view_online_url: '#',
      pages: 1200,
      file_size: '45.6 MB',
      language: 'English',
      publication_year: 2023,
      rating: 4.3,
      tags: ['mathematics', 'engineering', 'calculus']
    },
    {
      id: '4',
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      description: 'A magical story about following your dreams.',
      category: 'novels',
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      download_url: '#',
      view_online_url: '#',
      pages: 163,
      file_size: '2.1 MB',
      language: 'English',
      publication_year: 2021,
      rating: 4.7,
      tags: ['fiction', 'philosophy', 'adventure']
    },
    {
      id: '5',
      title: 'IEEE Computer Magazine',
      author: 'IEEE Computer Society',
      description: 'Latest trends in computer science and technology.',
      category: 'magazines',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=400&fit=crop',
      download_url: '#',
      view_online_url: '#',
      pages: 96,
      file_size: '12.4 MB',
      language: 'English',
      publication_year: 2024,
      rating: 4.2,
      tags: ['technology', 'computer science', 'research']
    }
  ];

  useEffect(() => {
    setBooks(sampleBooks); // Initialize with sample books
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedBookCategory || book.category === selectedBookCategory;
    
    return matchesSearch && matchesCategory;
  });

  const BookCategoryCard = ({ category }: { category: BookCategory }) => (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => {
        setSelectedBookCategory(category.id);
        setCurrentView('books');
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-lg ${category.color} text-white group-hover:scale-110 transition-transform`}>
            {category.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{category.bookCount} books</Badge>
          <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/50 text-white">
            ⭐ {book.rating}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{book.description}</p>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Pages: {book.pages}</span>
            <span>Size: {book.file_size}</span>
          </div>
          <div className="flex justify-between">
            <span>Language: {book.language}</span>
            <span>Year: {book.publication_year}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setPreviewBook(book)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => window.open(book.download_url, '_blank')}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
        
        {book.view_online_url && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2"
            onClick={() => window.open(book.view_online_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Online
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar isAuthenticated={!!user} onLogout={signOut} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {currentView === 'books' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentView('main');
                    setSelectedBookCategory('');
                  }}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {currentView === 'main' ? 'Library' : 
                 bookCategories.find(cat => cat.id === selectedBookCategory)?.name || 'Books'}
              </h1>
            </div>
          </div>

          {currentView === 'main' ? (
            <>
              {/* Book Categories Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Book className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Book Categories</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookCategories.map((category) => (
                    <BookCategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Books View */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books, authors, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No books found in this category</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Book Preview Modal */}
      <Dialog open={!!previewBook} onOpenChange={() => setPreviewBook(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewBook?.title}</DialogTitle>
          </DialogHeader>
          {previewBook && (
            <div className="space-y-4">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={previewBook.image_url}
                    alt={previewBook.title}
                    className="w-32 h-44 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-lg font-semibold">{previewBook.author}</p>
                    <p className="text-sm text-muted-foreground">Author</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Pages</p>
                      <p className="text-muted-foreground">{previewBook.pages}</p>
                    </div>
                    <div>
                      <p className="font-medium">File Size</p>
                      <p className="text-muted-foreground">{previewBook.file_size}</p>
                    </div>
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-muted-foreground">{previewBook.language}</p>
                    </div>
                    <div>
                      <p className="font-medium">Published</p>
                      <p className="text-muted-foreground">{previewBook.publication_year}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span>{previewBook.rating}/5</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Description</p>
                <p className="text-muted-foreground">{previewBook.description}</p>
              </div>
              
              <div>
                <p className="font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {previewBook.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => window.open(previewBook.download_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {previewBook.view_online_url && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(previewBook.view_online_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Online
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};