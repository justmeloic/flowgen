import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allComponents } from "@/lib/components";
import { CodeBlock } from "@/components/ui/code-block";

export const dynamicParams = false;

export async function generateStaticParams() {
  return allComponents.map((component) => ({
    slug: component.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const component = allComponents.find((c) => c.slug === params.slug);
  if (!component) {
    return {};
  }

  return {
    title: `${component.name} - GenAI Component`,
    description: component.description,
  };
}

export default function ComponentPage({
  params,
}: {
  params: { slug: string };
}) {
  const component = allComponents.find((c) => c.slug === params.slug);

  if (!component) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{component.name}</h1>
      <p className="text-xl mb-8 text-gray-600">{component.description}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Component Preview</h2>
        <div className="border-none rounded-xl p-6 bg-white ">
          <component.component />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Usage & Syntax</h2>
        <CodeBlock code={component.code} language="tsx" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Props</h2>
        {component.props.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Default</th>
                <th className="border p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {component.props.map((prop) => (
                <tr key={prop.name}>
                  <td className="border p-2 font-mono text-sm">{prop.name}</td>
                  <td className="border p-2 font-mono text-sm">{prop.type}</td>
                  <td className="border p-2 font-mono text-sm">
                    {prop.default || "-"}
                  </td>
                  <td className="border p-2">{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>This component does not have any props.</p>
        )}
      </section>
    </div>
  );
}
