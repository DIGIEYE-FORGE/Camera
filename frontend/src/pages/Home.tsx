import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import axios from "axios";
import { Link } from "react-router-dom";

const getCameras = async () => {
  const res = await axios.get(`http://${location.hostname}:3000/camera`);

  console.log({ res: res.data });

  return res.data;
};

const Home = () => {
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["cameras"],
    queryFn: () => getCameras(),
  });
  // TODO: implement search
  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden">
      <div className="flex flex-col items-center -bottom-4 absolute w-full z-10 pb-5 ">
        {/* {open && <div className="w-[90%] h-5 bg-white rounded-t-md"></div>} */}
        {open ? (
          <div
            className={`w-[90%] h-[500px] bg-white rounded-md shadow-md justify-evenly transition-all flex flex-wrap overflow-auto py-5 ${
              open ? "translate-y-[0px]" : "translate-y-[700px]"
            }`}
            onClick={() => setOpen(false)}
          >
            {(data || [])?.map(
              (camera: {
                _id: string;
                name: string;
                images: string[];
                status: string;
                location: string;
                updatedAt: string;
              }) => {
                return (
                  <Link
                    key={camera._id}
                    to={`/camera/${camera._id}`}
                    className="w-[300px] h-[250px] rounded-md shadow-md bg-white overflow-hidden flex flex-col gap-2 mt-5"
                  >
                    <div className="w-[300px] h-[180px]">
                      <img
                        src={`http://${location.hostname}:3000/${
                          camera.images[camera.images.length - 1]
                        }`}
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex items-center justify-between px-5">
                      <span className="text-lg font-bold capitalize">
                        {camera.name || "-"}
                      </span>
                      <span className="text-sm text-orange-600 font-semibold">
                        {camera.status || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-5">
                      <span className="text-xs text-gray-600">
                        {camera.location || "-"}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(camera.updatedAt)
                          .toISOString()
                          .split("T")[0] || "-"}
                      </span>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        ) : (
          <div
            className="w-[500px] h-4 rounded-lg shadow-md border border-gray-500 bg-white flex justify-center items-center cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <span className="w-[80%] h-1 bg-gray-300 shadow-md rounded-lg"></span>
          </div>
        )}
      </div>
      <div className="w-full h-full overflow-auto">
        <MapContainer
          center={[33.54311949758866, -7.6403287653050365]}
          zoom={10}
          className="w-full h-full z-0"
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default Home;
