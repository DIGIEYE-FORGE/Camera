import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  BsPlayFill,
  BsVolumeUpFill,
  BsFullscreen,
  BsFillPauseFill,
} from "react-icons/bs";
import { GiNextButton, GiPreviousButton } from "react-icons/gi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineSaveAlt } from "react-icons/md";
import { Button } from "@material-tailwind/react";

const getCamera = async (id: string) => {
  const res = await axios.get(`http://${location.hostname}:3000/camera/${id}`);

  console.log({ res: res.data });

  return res.data;
};

const Camera = () => {
  const { id } = useParams();
  const [count, setCount] = React.useState(0);
  const [play, setPlay] = React.useState(false);
  const [i, setI] = React.useState(0);
  const [playSpeed, setPlaySpeed] = React.useState(500);

  const { data } = useQuery({
    queryKey: ["camera", id],
    queryFn: () => getCamera(id || ""),
    enabled: !!id,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get(
        `http://${location.hostname}:3000/camera/${id}/export`
      );
      console.log({ res });

      return res.data;
    },
  });

  const handleClick = () => {
    setI(
      setInterval(() => {
        setCount((prev) => {
          // TODO: comment if you want video to play in infinite loop
          // if (prev === data.images.length - 1) {
          //   clearInterval(i);
          //   return prev;
          // }
          return (prev + 1) % data.images.length;
        });
      }, playSpeed)
    );
  };

  return (
    <div className="flex flex-col w-[90%] mx-auto mt-10 gap-5">
      <div className="flex items-center justify-between">
        <Link
          to={"/"}
          className="text-lg font-bold rounded-md shadow px-5 py-2 bg-blue-500/20 max-w-[200px] flex items-center gap-3"
          title={data?.name}
        >
          <IoMdArrowRoundBack />{" "}
          {(data?.name && data?.name.length > 10
            ? data?.name.substring(10) + "..."
            : data?.name) || "Loading..."}
        </Link>
        <Button
          className="flex items-center gap-3"
          onClick={() => exportMutation.mutate()}
        >
          <MdOutlineSaveAlt className="w-5 h-5" /> Export
        </Button>
      </div>
      {data && (
        <div className="w-[100%] h-[500px] bg-black rounded-lg shadow-md overflow-hidden relative">
          <img
            src={`http://${location.hostname}:3000/${data?.images[count]}`}
            alt=""
            //TODO: change to object-cover if you want the image to fit the container
            className="w-full h-full object-contain pointer-events-none"
          />
          <div
            className={`absolute w-[100%] h-10 bg-black/50 hover:-bottom-0 transition-[bottom] flex flex-col ${
              !play ? "-bottom-0" : "-bottom-7"
            }`}
          >
            <div className="w-full bg-green-400/20">
              <div
                className="h-3 bg-green-400 shadow-inner"
                style={{
                  width: `${((count + 1) / data.images.length) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between flex-1 items-center px-5">
              <div className="flex gap-3 [&>*]:text-white [&>*]:w-5 [&>*]:h-5 items-center">
                <GiPreviousButton
                  className="cursor-pointer hover:text-gray-500"
                  onClick={() => {
                    clearInterval(i);
                    setPlaySpeed((prev) => {
                      if (prev >= 2000) return prev;
                      return prev * 2;
                    });
                    setI(
                      setInterval(() => {
                        setCount((prev) => {
                          return (prev + 1) % data.images.length;
                        });
                      }, playSpeed)
                    );
                    setPlay(true);
                  }}
                />
                {play ? (
                  <BsFillPauseFill
                    className="cursor-pointer hover:text-gray-500"
                    onClick={() => {
                      setPlay(false);
                      clearInterval(i);
                    }}
                  />
                ) : (
                  <BsPlayFill
                    className="cursor-pointer hover:text-gray-500"
                    onClick={() => {
                      handleClick();
                      setPlay(true);
                    }}
                  />
                )}
                <GiNextButton
                  className="cursor-pointer hover:text-gray-500"
                  onClick={() => {
                    clearInterval(i);
                    setPlaySpeed((prev) => {
                      if (prev <= 75) return prev;
                      return Math.floor(prev / 2);
                    });
                    setI(
                      setInterval(() => {
                        setCount((prev) => {
                          return (prev + 1) % data.images.length;
                        });
                      }, playSpeed)
                    );
                    setPlay(true);
                  }}
                />
                <BsVolumeUpFill className="cursor-pointer hover:text-gray-500" />
                <span className="font-semibold !text-green-500">
                  {500 / playSpeed >= 1
                    ? Math.floor(500 / playSpeed)
                    : (500 / playSpeed).toFixed(2)}
                  x {playSpeed.toString()}
                </span>
              </div>
              <div className="[&>*]:text-white [&>*]:w-5 [&>*]:h-5">
                <BsFullscreen className="cursor-pointer hover:text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-lg  text-gray-700">
          {new Date(data?.updatedAt || Date.now())
            .toISOString()
            .split("T")[0] || "-"}
        </span>
        <span className="text-lg  text-gray-700">{data?.location || "-"}</span>
      </div>
      <div className="">
        <h1 className="font-semibold text-lg">Events</h1>
        <div className="mt-5 w-full h-64 overflow-auto bg-gray-100 p-5 rounded-md shadow">
          <p className="text-base font-semibold text-green-500">
            Vehicle recognition: Truck N°178215 - Time: 3:36.
          </p>
          <p className="text-base font-semibold text-red-500">
            Employee recognition: Jadid Nouh - Time: 3:30 PM.
          </p>
          <p className="text-base font-semibold text-orange-400">
            Employee recognition: Hassani Ibrahim - Time: 2:48 PM.
          </p>
          <p className="text-base font-semibold text-green-500">
            Vehicle recognition: Truck N°178215 - Time: 3:36.
          </p>
          <p className="text-base font-semibold text-red-500">
            Employee recognition: Jadid Nouh - Time: 3:30 PM.
          </p>
          <p className="text-base font-semibold text-orange-400">
            Employee recognition: Hassani Ibrahim - Time: 2:48 PM.
          </p>
          <p className="text-base font-semibold text-green-500">
            Vehicle recognition: Truck N°178215 - Time: 3:36.
          </p>
          <p className="text-base font-semibold text-red-500">
            Employee recognition: Jadid Nouh - Time: 3:30 PM.
          </p>
          <p className="text-base font-semibold text-orange-400">
            Employee recognition: Hassani Ibrahim - Time: 2:48 PM.
          </p>
          <p className="text-base font-semibold text-green-500">
            Vehicle recognition: Truck N°178215 - Time: 3:36.
          </p>
          <p className="text-base font-semibold text-red-500">
            Employee recognition: Jadid Nouh - Time: 3:30 PM.
          </p>
          <p className="text-base font-semibold text-orange-400">
            Employee recognition: Hassani Ibrahim - Time: 2:48 PM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Camera;
