import dayjs from "dayjs";
import { getCustomer } from "@/lib/api/account";
import { getComments, type PostComment } from "@/lib/api/posts";
import { CommentForm } from "./commentForm";

/** Sand band under a post: approved comments (threaded one level, as WP shows them) and the reply form */
export async function PostComments({ postId, open }: { postId: number; open: boolean }) {
	// a WP outage or a missing account snippet shouldn't take the comments down with it
	const [comments, customer] = await Promise.all([getComments(postId), getCustomer().catch(() => null)]);
	if (!open && !comments.length) return null;

	const replies = (id: number) => comments.filter((c) => c.parent === id);

	return (
		<section id="comments" className="col-full bg-sand px-2.5 py-14 md:px-5 md:py-20">
			<div className="mx-auto max-w-site space-y-8">
				<h2 className="text-h3">Comment{comments.length === 1 ? "" : "s"}</h2>

				{comments.length ? (
					<ol className="space-y-6">
						{replies(0).map((c) => (
							<li key={c.id} className="space-y-4">
								<Comment comment={c} />
								{replies(c.id).length ? (
									<ol className="space-y-4 border-l border-grey/40 pl-6">
										{replies(c.id).map((r) => (
											<li key={r.id}>
												<Comment comment={r} />
											</li>
										))}
									</ol>
								) : null}
							</li>
						))}
					</ol>
				) : null}

				{open ? (
					<CommentForm postId={postId} signedInAs={customer ? customer.display_name : undefined} />
				) : (
					<p className="text-sm text-charcoal">Comments are closed.</p>
				)}
			</div>
		</section>
	);
}

function Comment({ comment }: { comment: PostComment }) {
	return (
		<article className="space-y-2 bg-white p-5">
			<p className="text-sm text-black">
				{comment.author} <span className="ml-2 text-xs text-grey">{dayjs(comment.date).format("MMMM D, YYYY")}</span>
			</p>
			{/* rendered by WP, already filtered with wp_kses */}
			<div className="prose-majeurs text-sm text-charcoal" dangerouslySetInnerHTML={{ __html: comment.content }} />
		</article>
	);
}
