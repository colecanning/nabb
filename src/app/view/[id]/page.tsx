import { notFound } from 'next/navigation';
import { supabase } from '@/lib/backend/supabase';
import { ViewSaveContent } from './ViewSaveContent';

interface ViewPageProps {
  params: {
    id: string;
  };
}

async function getSave(id: string) {
  const { data, error } = await supabase
    .from('saves')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const save = await getSave(params.id);

  if (!save) {
    notFound();
  }

  return (
    <ViewSaveContent save={save} />
  );
}

