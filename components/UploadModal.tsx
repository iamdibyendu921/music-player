import { useState, useEffect, useCallback } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import uniqid from "uniqid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useUploadModal from "@/hooks/useUploadModal";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invalidFileError, setInvalidFileError] = useState<string | null>(null);  // For error handling
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const { register, handleSubmit, reset, watch } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const closeModal = useCallback(() => {
    reset();
    uploadModal.onClose();
    setInvalidFileError(null);  // Reset error when closing modal
  }, [reset, uploadModal]);

  // File validation function
  const validateFile = (file: File | null, type: string) => {
    if (!file) return true;

    const isValidType =
      type === "song"
        ? file.type === "audio/mpeg"
        : file.type.startsWith("image/");

    if (!isValidType) {
      setInvalidFileError(`Invalid ${type} file. Please select a valid ${type}.`);
      return false;
    }

    setInvalidFileError(null); // Reset error if valid
    return true;
  };

  // Watch for file inputs
  const songFile = watch("song");
  const imageFile = watch("image");

  useEffect(() => {
    validateFile(songFile?.[0], "song");
    validateFile(imageFile?.[0], "image");
  }, [songFile, imageFile]);

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    if (invalidFileError) return;  // Don't submit if there's a validation error

    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];
      if (!imageFile || !songFile || !user) {
        toast.error("Missing fields");
        return;
      }

      const uniqueID = uniqid();

      const { data: songData, error: songError } = await supabaseClient
        .storage
        .from("songs")
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        return toast.error("Failed song upload");
      }

      const { data: imageData, error: imageError } = await supabaseClient
        .storage
        .from("images")
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (imageError) {
        setIsLoading(false);
        return toast.error("Failed image upload");
      }

      const { error: supabaseError } = await supabaseClient.from("songs").insert({
        user_id: user.id,
        title: values.title,
        author: values.author,
        image_path: imageData.path,
        song_path: songData.path,
      });

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      toast.success("Song created!");
      closeModal();
      window.location.reload();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!uploadModal.isOpen) return null;

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
        <h2 className="text-xl font-bold text-center mb-2">Add a Song</h2>
        <p className="text-sm text-center mb-4">Upload an MP3 file</p>
        {invalidFileError && (
          <p className="text-red-500 text-sm">{invalidFileError}</p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
          <Input
            id="title"
            disabled={isLoading}
            {...register("title", { required: true })}
            placeholder="Song title"
          />
          <Input
            id="author"
            disabled={isLoading}
            {...register("author", { required: true })}
            placeholder="Song author"
          />
          <div>
            <div className="pb-1">Select a Song file</div>
            <Input
              id="song"
              type="file"
              disabled={isLoading}
              accept=".mp3"
              {...register("song", { required: true })}
            />
          </div>
          <div>
            <div className="pb-1">Select an Image</div>
            <Input
              id="image"
              type="file"
              disabled={isLoading}
              accept="image/*"
              {...register("image", { required: true })}
            />
          </div>
          <Button disabled={isLoading} type="submit">
            Create
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

