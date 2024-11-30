import Image from 'next/image';
import { User } from 'firebase/auth';

interface AvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export default function Avatar({ user, size = 'md' }: AvatarProps) {
  if (!user?.photoURL) {
    return (
      <div className={`${sizeMap[size]} rounded-full bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500 font-medium text-sm">
          {user?.email?.[0].toUpperCase() || '?'}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeMap[size]} relative`}>
      <Image
        src={user.photoURL}
        alt={user.displayName || 'User avatar'}
        className="rounded-full object-cover"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
