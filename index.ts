export interface Env {
	MY_BUCKET: R2Bucket;
	FORWARD_EMAIL: string;
}

export default {
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		try {
			// 1. 保存するファイル名を生成（例: 2024-03-11T00:00:00Z-test@example.com.eml）
			const timestamp = new Date().toISOString();
			const fileName = `${timestamp}-${message.from}.eml`;

			console.log(`Receiving email from: ${message.from}, to: ${message.to}`);
			console.log(`Filename: ${fileName}`);

			// 2. メールの生データ（raw）を読み取る
			// message.rawSize にサイズがあるので、それを使ってR2に保存
			const rawEmail = await new Response(message.raw).arrayBuffer();

			// 3. R2に保存
			await env.MY_BUCKET.put(fileName, rawEmail, {
				httpMetadata: {
					contentType: "message/rfc822", // メールの標準形式を指定
				}
			});

			console.log(`Successfully saved email to R2: ${fileName} (${rawEmail.byteLength} bytes)`);

			// 4. メールを転送
			await message.forward(env.FORWARD_EMAIL);
			console.log(`Forwarded email to: ${env.FORWARD_EMAIL}`);
		} catch (error) {
			console.error("Error processing email:", error);
			throw error;
		}
	}
};
