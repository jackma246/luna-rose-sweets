import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  COTTAGE_FOOD_NOTICE,
  getIngredientPageBySlug,
  ingredientPages,
} from "@/data/ingredients";
import V2Footer from "../../components/V2Footer";

export function generateStaticParams() {
  return ingredientPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getIngredientPageBySlug(slug);
  if (!page) return { title: "Ingredients · Dip & Sprinkle" };
  return {
    title: `${page.name} — Ingredients · Dip & Sprinkle`,
    description: page.lead,
  };
}

export default async function IngredientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getIngredientPageBySlug(slug);
  if (!page) notFound();

  const crumbs = page.breadcrumb;

  return (
    <>
      <section className="ing-hero">
        <Link href="/" className="ing-brand">
          Dip <span className="amp">&amp;</span> Sprinkle
        </Link>

        <nav className="ing-crumb" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb}>
              {i > 0 && <span className="sep"> / </span>}
              {i === crumbs.length - 1 ? <b>{crumb}</b> : crumb}
            </span>
          ))}
        </nav>

        <div className="ing-photo">
          <Image
            src={page.image}
            alt={page.imageAlt}
            width={460}
            height={460}
            priority
          />
        </div>

        <div className="ing-title">
          <div className="ing-kicker">{page.kicker}</div>
          <h1>{page.name}</h1>
        </div>
      </section>

      <div className="ing-body">
        <p className="ing-lead">{page.lead}</p>

        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="ing-sec">{section.heading}</h2>
            <p className="ing-list">{section.body}</p>
          </section>
        ))}

        <p className="ing-contains">Contains: {page.contains.join(", ")}</p>

        <div className="ing-cottage">
          <b>{COTTAGE_FOOD_NOTICE.heading}</b>
          {COTTAGE_FOOD_NOTICE.body} Permit no. {COTTAGE_FOOD_NOTICE.permitNumber} ·
          Issued in county: {COTTAGE_FOOD_NOTICE.county}.
        </div>

        {page.productSlug && (
          <div className="ing-cta">
            <Link href={`/products/${page.productSlug}`} className="btn btn-primary">
              Order these →
            </Link>
          </div>
        )}
      </div>

      <V2Footer />
    </>
  );
}
