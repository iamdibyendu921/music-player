import getSongs from "@/actions/getSongs";
import Header from "@/components/Header";
import PageContent from "./components/PageContent";


export default async function Home() {

  const songs = await getSongs();


  return (
    <div className=" bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto  ">
      <Header>
        <div className="mb-2">
          <h1
          className=" text-white text-3xl font-semibold">
            Music App
          </h1>
        </div>
      </Header>
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">
            Newest Songs
          </h1>
        </div>
        <PageContent songs={songs} />
      </div>
    </div>
  );
}



