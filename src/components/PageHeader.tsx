import Logo from "./Logo";
import BackButton from "./BackButton";

interface PageHeaderProps {
  showBack?: boolean;
  backTo?: string;
  title?: string;
}

const PageHeader = ({ showBack = true, backTo, title }: PageHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          {showBack && <BackButton to={backTo} />}
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
        <Logo size="sm" showText={false} />
      </div>
    </header>
  );
};

export default PageHeader;
