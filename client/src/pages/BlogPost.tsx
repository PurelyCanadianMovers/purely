import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SiteLayout from "@/components/SiteLayout";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Clock, Calendar, ArrowLeft, Phone } from "lucide-react";
import { Streamdown } from "streamdown";

interface BlogPostProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPostProps) {
  const { data: post, isLoading, isError } = trpc.blog.getBySlug.useQuery({ slug: params.slug });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container py-20">
          <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded" />)}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (isError || !post) {
    return (
      <SiteLayout>
        <SEO title="Post Not Found | Purely Canadian Movers" description="The blog post you're looking for could not be found." canonical="/blog/" />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="font-body text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold">
            <Link href="/blog/">Back to Blog</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEO
        title={`${post.title} | Purely Canadian Movers Blog`}
        description={post.metaDescription || post.title}
        canonical={`/blog/${post.slug}/`}
        ogImage={post.coverImageUrl || undefined}
        noIndex={post.status !== "published"}
      />

      {/* Hero */}
      <section className="bg-gray-900 py-12">
        <div className="container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="font-body text-sm text-gray-400 hover:text-white">Home</Link>
              <span className="text-gray-600">/</span>
              <Link href="/blog/" className="font-body text-sm text-gray-400 hover:text-white">Blog</Link>
              <span className="text-gray-600">/</span>
              <span className="font-body text-sm text-gray-300 line-clamp-1">{post.title}</span>
            </div>
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-body">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(post.publishedAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.readTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-10">
            <article className="lg:col-span-3">
              {post.coverImageUrl && (
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8"
                />
              )}
              <div className="prose prose-gray max-w-none font-body">
                <Streamdown>{post.content}</Streamdown>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-200">
                <Link href="/blog/" className="inline-flex items-center gap-2 font-body text-sm font-semibold text-[#CC1A1A] hover:text-[#A31515]">
                  <ArrowLeft size={14} /> Back to Blog
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-3">Ready to Move?</h3>
                <p className="font-body text-sm text-gray-600 mb-4">Get a free, no-obligation estimate from Metro Vancouver's most trusted movers.</p>
                <Button asChild className="w-full bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold mb-3">
                  <Link href="/contact/">Get a Free Estimate</Link>
                </Button>
                <a href="tel:18774856683" className="flex items-center justify-center gap-2 font-body text-sm font-semibold text-[#CC1A1A] hover:text-[#A31515]">
                  <Phone size={14} /> 1-877-485-6683
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
