import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
}

const SocialShare = ({ url, title, description }: SocialShareProps) => {
  const { toast } = useToast();
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || "");

  const links = [
    { icon: Facebook, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "hover:text-blue-600" },
    { icon: Twitter, label: "X/Twitter", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, color: "hover:text-gray-900 dark:hover:text-gray-100" },
    { icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: "hover:text-blue-700" },
    { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: "hover:text-green-600" },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "লিংক কপি হয়েছে!" });
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-muted-foreground mr-1">শেয়ার:</span>
      {links.map(({ icon: Icon, label, href, color }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}>
          <Button variant="ghost" size="icon" className={`h-8 w-8 ${color}`}>
            <Icon className="h-4 w-4" />
          </Button>
        </a>
      ))}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink} title="Copy Link">
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShare;
