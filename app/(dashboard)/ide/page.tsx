import UserDockerIDE from "@/components/UserDockerIDE";

export default function DockerIDEPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Docker IDE</h1>
      <UserDockerIDE userName="user" accessToken="" />
    </div>
  );
}
