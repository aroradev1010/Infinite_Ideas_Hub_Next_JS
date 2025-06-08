"use client";

import useSWR from "swr";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"; // or react-hot-toast
import { formatDate } from "@/lib/utils";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PrimaryButton from "./PrimaryButton";

const commentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  message: z.string().min(1, "Message is required"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface Comment {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CommentSection({ blogId }: { blogId: string }) {
  const { data: comments = [], mutate } = useSWR<Comment[]>(
    `/api/comments?blogId=${blogId}`,
    fetcher
  );

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, ...data }),
    });

    if (!res.ok) {
      toast.error("Failed to post comment");
      return;
    }

    const { insertedId } = await res.json();
    const newComment: Comment = {
      _id: insertedId,
      name: data.name,
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    mutate([newComment, ...comments], false);
    form.reset();
  };

  return (
    <>
      <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
        Comments
      </h1>
      <div className="rounded-xl p-6 mt-8 mx-auto text-white border-1 border-gray-800">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PrimaryButton text="Post Comment" />
          </form>
        </Form>
      </div>

      <div className="mt-8 space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="border p-4 rounded-xl">
            <div className="text-sm font-semibold">{comment.name}</div>
            <p className="text-sm text-gray-300">{comment.message}</p>
            <div className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
