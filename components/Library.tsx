"use client";
import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"; 
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import useUploadModal from "@/hooks/useUploadModal";
import useEditModal from "@/hooks/useEditModal";  
import { Song } from "@/types";
import MediaItem from "./MediaItem";
import useDeleteSong from "@/hooks/useDeleteSong";
import useOnPlay from "@/hooks/useOnPlay";

interface LibraryProps {
    songs: Song[];
}

const Library: React.FC<LibraryProps> = ({ songs: initialSongs }) => {
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const editModal = useEditModal();
    const { user } = useUser();
    const { songs, deleteSong } = useDeleteSong(initialSongs);
    const onPlay = useOnPlay(songs)

    const onClick = () => {
        if (!user) {
            return authModal.onOpen();
        }
        return uploadModal.onOpen();
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4">
                <div className="inline-flex items-center gap-x-2">
                    <TbPlaylist className="text-neutral-400" size={26} />
                    <p className="text-neutral-400 font-medium text-md">Your Library</p>
                </div>
                <AiOutlinePlus
                    onClick={onClick}
                    size={20}
                    className="text-neutral-400 cursor-pointer hover:text-white transition"
                />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 px-3">
                {songs.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <MediaItem data={item} onClick={(id: string) => onPlay(id)} />
                        <div className="flex items-center gap-x-3">
                            <AiOutlineEdit
                                onClick={() => editModal.onOpen(item)}
                                size={20}
                                className="text-neutral-400 cursor-pointer hover:text-blue-500 transition"
                            />
                            <AiOutlineDelete
                                onClick={() => deleteSong(item.id)}
                                size={20}
                                className="text-neutral-400 cursor-pointer hover:text-red-500 transition"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Library;

