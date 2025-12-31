import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/api";
import axios from "axios";

const schema = z.object({
  username: z.string().min(1, { message: "请输入用户名" }),
  password: z.string().min(6, { message: "密码至少 6 位" }),
});


type FormValues = z.infer<typeof schema>;

const setMeta = (title: string, description: string) => {
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", description);
  } else {
    const m = document.createElement("meta");
    m.name = "description";
    m.content = description;
    document.head.appendChild(m);
  }
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = window.location.origin + "/login";
    document.head.appendChild(link);
  }
};

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access && access.trim()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);
  
  useEffect(() => {
    setMeta("登录 | Bella Nails", "登录 Bella Nails，美甲预约管理更便捷");
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const { data } = await auth.login(values);
      const access = data?.access ?? data?.token ?? data?.access_token;
      const refresh = data?.refresh ?? data?.refresh_token ?? "";
      if (!access) throw new Error("登录失败，请检查账号或稍后再试");
      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      toast({ title: "登录成功", 
        description: "欢迎回来！", 
        duration: 3000, });
      navigate("/admin", { replace: true });

    } catch (err: any) {
      toast({ title: "登录失败", 
        description: "请检查邮箱与密码", 
        variant: "destructive" as any,
        duration: 5000, });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24">
      <article className="w-full max-w-md border rounded-lg p-6 bg-card shadow-sm">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-serif font-semibold">登录</h1>
          <p className="text-sm text-muted-foreground mt-1">进入账户以管理预约</p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="username" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </Form>

        <aside className="mt-4 text-center">
          <Button variant="link" onClick={() => navigate("/")}>返回首页</Button>
        </aside>
      </article>
    </main>
  );
}