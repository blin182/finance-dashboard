import { Suspense } from 'react';
import { fetchFilteredCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';

  return (
    <div className="w-full">
      <Suspense key={query} fallback={<InvoicesTableSkeleton />}>
        <CustomersWrapper query={query} />
      </Suspense>
    </div>
  );
}

async function CustomersWrapper({ query }: { query: string }) {
  const customers = await fetchFilteredCustomers(query);

  return <CustomersTable customers={customers} />;
}
