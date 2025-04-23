import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Song } from '@/types';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

const useDeleteSong = (initialSongs: Song[]) => {
    const [songs, setSongs] = useState<Song[]>(initialSongs);
    const supabase = useSupabaseClient();
    const { user } = useUser();
    const router = useRouter();

    const deleteSong = useCallback(async (id: string) => {
        if (!user) {
            console.error("User is not authenticated");
            return;
        }

        console.log("Deleting song with ID:", id, "for user:", user.id);

        const { error } = await supabase
            .from('songs')
            .delete()
            .match({ id, user_id: user.id });

        if (error) {
            console.error("Error deleting song:", error);
            return;
        }

        console.log("Song deleted successfully");
        setSongs(prevSongs => prevSongs.filter(song => song.id !== id));
        
        router.refresh();
    }, [supabase, user, router]);

    return { songs, deleteSong };
};

export default useDeleteSong;

