import { useState, useEffect } from 'react';
import { User, Book, Award, Building, Tag, ExternalLink, AlertCircle, Users } from 'lucide-react';
import { getAuthorProfile } from '@/utils/serplyApi';
import Image from 'next/image';

const AuthorProfile = ({ authorId }) => {
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [coAuthors, setCoAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!authorId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAuthorProfile(authorId);
        setAuthor(data.authorInfo);
        setArticles(data.articles || []);
        setCoAuthors(data.coAuthors || []);
      } catch (err) {
        setError('Failed to load author profile. Please try again.');
        console.error('Author profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorId]);

  if (!authorId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Author ID is required to show profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {error && (
        <div className="m-6 p-4 text-sm text-red-700 bg-red-100 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : author ? (
        <div>
          {/* Author Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              {author.thumbnailUrl && (
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-white">
                    <Image 
                      src={author.thumbnailUrl} 
                      alt={author.name || 'Author'} 
                      width={96} 
                      height={96}
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">{author.name}</h2>
                
                {author.affiliations && (
                  <div className="flex justify-center sm:justify-start items-center mt-2 text-blue-100">
                    <Building className="h-4 w-4 mr-2" />
                    <span>{author.affiliations}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap justify-center sm:justify-start mt-4 gap-2">
                  {author.interests && author.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Citation Stats */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Citation Metrics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Citations</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{author.citationsAll}</p>
                <p className="text-xs text-gray-500">Since 2019: {author.citationsSince2019}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">h-index</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{author.hIndexAll}</p>
                <p className="text-xs text-gray-500">Since 2019: {author.hIndexSince2019}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">i10-index</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{author.i10IndexAll}</p>
                <p className="text-xs text-gray-500">Since 2019: {author.i10IndexSince2019}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Articles</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{articles.length}</p>
                <p className="text-xs text-gray-500">Co-authors: {coAuthors.length}</p>
              </div>
            </div>
          </div>
          
          {/* Publications */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Publications</h3>
              {articles.length > 0 && (
                <span className="text-sm text-gray-500">
                  Showing {Math.min(5, articles.length)} of {articles.length}
                </span>
              )}
            </div>
            
            {articles.length > 0 ? (
              <div className="space-y-5">
                {articles.slice(0, 5).map((article, index) => (
                  <div key={index} className="pb-5 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <h4 className="text-md font-medium text-blue-600 hover:underline">
                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-start">
                        <Book className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{article.title}</span>
                      </a>
                    </h4>
                    
                    <div className="mt-1 text-sm text-gray-600">
                      {article.authors && <p>{article.authors}</p>}
                      {article.publication && <p className="mt-1 italic">{article.publication}</p>}
                      {article.year && <p className="mt-1">Year: {article.year}</p>}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap text-xs">
                      {article.cited_by?.value > 0 && (
                        <span className="inline-flex items-center mr-3 mb-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                          <Award className="h-3 w-3 mr-1" />
                          Cited by: {article.cited_by.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {articles.length > 5 && (
                  <div className="mt-6 text-center">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      View all {articles.length} publications
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No publications available.
              </div>
            )}
          </div>
          
          {/* Co-authors */}
          {coAuthors.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Co-authors</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {coAuthors.slice(0, 6).map((coAuthor, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {coAuthor.thumbnail ? (
                      <div className="flex-shrink-0 mr-3">
                        <Image 
                          src={coAuthor.thumbnail} 
                          alt={coAuthor.name || 'Co-author'} 
                          width={40} 
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {coAuthor.name}
                      </p>
                      {coAuthor.affiliations && (
                        <p className="text-xs text-gray-500 truncate">
                          {coAuthor.affiliations}
                        </p>
                      )}
                    </div>
                    
                    {coAuthor.author_id && (
                      <div className="ml-2">
                        <a 
                          href={`https://scholar.google.com/citations?user=${coAuthor.author_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {coAuthors.length > 6 && (
                <div className="mt-6 text-center">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-2" />
                    View all {coAuthors.length} co-authors
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : !loading ? (
        <div className="py-8 text-center p-6">
          <User className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Author not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The author profile could not be retrieved or doesn&apos;t exist.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default AuthorProfile;