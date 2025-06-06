"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { formatDate } from "@/lib/utils";

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

export default function CommentSection({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  useEffect(() => {
    fetch(`/api/comments?blogId=${blogId}`)
      .then((res) => res.json())
      .then((data: Comment[]) => setComments(data));
  }, [blogId]);

  const onSubmit = async (data: CommentFormData) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, ...data }),
    });

    if (res.ok) {
      const { insertedId } = await res.json();
      const newComment: Comment = {
        _id: insertedId,
        name: data.name,
        message: data.message,
        createdAt: new Date().toISOString(),
      };
      setComments([newComment, ...comments]);
      form.reset();
    }
  };

  return (
    <>
      <h1 className="font-bold text-md px-4 mb-5 uppercase tracking-wider">
        Comments
      </h1>
      <div className="rounded-xl p-6 mt-8  mx-auto text-white border-1 border-gray-800">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none h-24"
                      placeholder="Write your comment here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PrimaryButton type="submit" className="" text="Publish" />
          </form>
        </Form>

        <hr className="border-neutral-800 my-6" />

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 items-start">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold"
                title={comment.name}
              >
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.name}</span>
                  <span className="text-xs text-neutral-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-neutral-200">{comment.message}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-neutral-400 text-md">
              No comments yet, add one now.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
