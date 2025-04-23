"use client";

import { useState, useEffect, useCallback } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useEditModal from "@/hooks/useEditModal";

interface SongUpdatePayload {
  title: string;
  author: string;
  updated_at: string;
  image_path?: string;
  song_path?: string;
}

const EditModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const editModal = useEditModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const { register, handleSubmit, reset, setValue } = useForm<FieldValues>();

  useEffect(() => {
    if (editModal.song) {
      setValue("title", editModal.song.title);
      setValue("author", editModal.song.author);
    }
  }, [editModal.song, setValue]);

  const closeModal = useCallback(() => {
    reset();
    editModal.onClose();
  }, [reset, editModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    if (editModal.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editModal.isOpen, closeModal]);

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user || !editModal.song) {
        toast.error("Missing song data");
        return;
      }

      const updates: SongUpdatePayload = {
        title: values.title,
        author: values.author,
        updated_at: new Date().toISOString(),
      };

      if (values.image?.[0]) {
        const { data: imageData, error: imageError } = await supabaseClient
          .storage
          .from("images")
          .upload(`image-${values.title}-${editModal.song.id}`, values.image[0], { upsert: true });

        if (imageError) throw imageError;
        updates.image_path = imageData.path;
      } else {
        updates.image_path = editModal.song.image_path;
      }

      if (values.song?.[0]) {
        const { data: songData, error: songError } = await supabaseClient
          .storage
          .from("songs")
          .upload(`song-${values.title}-${editModal.song.id}`, values.song[0], { upsert: true });

        if (songError) throw songError;
        updates.song_path = songData.path;
      } else {
        updates.song_path = editModal.song.song_path;
      }

      const { error: updateError } = await supabaseClient
        .from("songs")
        .update(updates)
        .match({ id: editModal.song.id, user_id: user.id });

      if (updateError) {
        console.error("Supabase update error:", updateError);
        toast.error(updateError.message);
        return;
      }

      toast.success("Song updated!");
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed to update song");
    } finally {
      setIsLoading(false);
    }
  };

  if (!editModal.isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-neutral-900/90 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="relative bg-neutral-800 border border-neutral-700 rounded-md p-6 w-full max-w-md shadow-lg z-50">
        <button
          className="absolute top-3 right-3 text-neutral-400 hover:text-white"
          onClick={closeModal}
        >
          <IoMdClose size={24} />
        </button>

        <h2 className="text-xl font-bold text-center mb-2">Edit Album</h2>
        <p className="text-sm text-center mb-4">Modify song details</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
          <Input id="title" disabled={isLoading} {...register("title", { required: true })} placeholder="Song title" />
          <Input id="author" disabled={isLoading} {...register("author", { required: true })} placeholder="Song author" />
          <div>
            <div className="pb-1">Replace Song File</div>
            <Input id="song" type="file" disabled={isLoading} accept=".mp3" {...register("song")} />
          </div>
          <div>
            <div className="pb-1">Replace Image</div>
            <Input id="image" type="file" disabled={isLoading} accept="image/*" {...register("image")} />
          </div>
          <Button disabled={isLoading} type="submit">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditModal;


