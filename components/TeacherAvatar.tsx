/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

type TeacherAvatarProps = {
  initials: string;
  photoUrl?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

export function TeacherAvatar({
  initials,
  photoUrl,
  alt,
  className,
  imgClassName,
}: TeacherAvatarProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={alt}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
