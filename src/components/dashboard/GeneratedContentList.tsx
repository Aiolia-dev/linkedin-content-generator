import { GeneratedContent } from './ContentGenerator';

interface GeneratedContentListProps {
  contents: GeneratedContent[];
  onShare?: (content: GeneratedContent) => void;
  onDelete?: (content: GeneratedContent) => void;
}

export default function GeneratedContentList({
  contents,
  onShare,
  onDelete,
}: GeneratedContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No content yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by generating your first LinkedIn post.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contents.map((content, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
              <p className="mt-1 text-sm text-gray-500">Topic: {content.topic}</p>
              <p className="mt-1 text-sm text-gray-500">Tone: {content.tone}</p>
            </div>
            <div className="flex space-x-2">
              {onShare && (
                <button
                  onClick={() => onShare(content)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Share on LinkedIn
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(content)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-700 whitespace-pre-wrap">{content.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
