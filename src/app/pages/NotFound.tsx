import { Link } from 'react-router';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center page-section">
      <SEO
        title="Page Not Found"
        description="The page you are looking for could not be found."
        canonicalPath="/404"
      />
      <div className="text-center px-4">
        <h1 className="text-5xl mb-4">404</h1>
        <p className="text-muted-foreground mb-8">The page you requested does not exist.</p>
        <Link to="/">
          <Button>Go Back Home</Button>
        </Link>
      </div>
    </div>
  );
}

