import React, { useState, useEffect } from 'react';
import Router, { useRouter  } from 'next/router';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import axios from 'axios';
import { SanityAssetDocument } from '@sanity/client';

import useAuthStore from '../store/authStore';
import { client } from '../utils/client';

import { topics } from '../utils/constants'

const Upload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [videoAsset, setVideoAsset] = useState<SanityAssetDocument | undefined>();
    const [wrongFileType, setWrongFileType] = useState(false)
    const loading = false;
    const [caption, setCaption] = useState('');
    const [category, setCategory] = useState(topics[0].name);
    const [savingPost, setsavingPost] = useState(false);

    const { userProfile }: { userProfile: any} = useAuthStore();
    const router = useRouter();

    const uploadVideo = async (e: any) => {
        const selectedFile = e.target.files[0];
        const fileTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        
        if(fileTypes.includes(selectedFile.type)) {
            client.assets.upload('file', selectedFile, {
                contentType: selectedFile.type,
                filename: selectedFile.name
            })
            .then((data) => {
                setVideoAsset(data);
                setIsLoading(false);
            })
        } else {
            setIsLoading(false);
            setWrongFileType(true);
        }
    }

    const handlePost = async () => {
        if(caption && videoAsset?._id && category) {
            setsavingPost(true);

            const document = {
                _type: 'post',
                caption,
                video: {
                    _type: 'file',
                    asset: {
                        _type: 'reference',
                        _ref: videoAsset?._id
                    }
                },
                userId: userProfile?._id,
                postedBy: {
                    _type: 'postedBy',
                    _ref: userProfile?._id
                },
                topic: category
            }

            await axios.post('http://localhost:3000/api/post', document);
            router.push('/')
        }
    }

  return (
    <div className='flex w-full h-full absolute left-0 top-[60px] lg:top-[70px] mb-10 pt-10 lg:pt-20 bg-[#F8F8F8] justify-center'>
    <div className=' bg-white rounded-lg xl:h-[80vh] xl:w-[60%] flex gap-6 flex-wrap justify-center items-center p-14 pt-6'>
      <div>
        <div>
          <p className='text-2xl font-bold'>Subir Video</p>
          <p className='text-md text-gray-400 mt-1'>Subir video a tu cuenta</p>
        </div>
        <div className=' border-dashed rounded-xl border-4 border-gray-200 flex flex-col justify-center items-center  outline-none mt-10 w-[260px] h-[458px] p-10 cursor-pointer hover:border-red-300 hover:bg-gray-100'>
          {loading ? (
            <p className='text-center text-3xl text-red-400 font-semibold'>
              Subiendo...
            </p>
          ) : (
            <div>
              {!videoAsset ? (
                <label className='cursor-pointer'>
                  <div className='flex flex-col items-center justify-center h-full'>
                    <div className='flex flex-col justify-center items-center'>
                      <p className='font-bold text-xl'>
                        <FaCloudUploadAlt className='text-gray-300 text-6xl' />
                      </p>
                      <p className='text-xl font-semibold'>
                        Subir Video
                      </p>
                    </div>

                    <p className='text-gray-400 text-center mt-10 text-sm leading-10'>
                      MP4 o WebM y ogg <br />
                      720x1280 o Mas <br />
                      Hasta 10 minutos <br />
                      Menos de 2 GB
                    </p>
                    <p className='bg-[#F51997] text-center mt-8 rounded text-white text-md font-medium p-2 w-52 outline-none'>
                      Seleccionar Archivo
                    </p>
                  </div>
                  <input
                    type='file'
                    name='upload-video'
                    onChange={(e) => uploadVideo(e)}
                    className='w-0 h-0'
                  />
                </label>
              ) : (
                <div className=' rounded-3xl w-[300px]  p-4 flex flex-col gap-6 justify-center items-center'>
                  <video
                    className='rounded-xl h-[462px] mt-16 bg-black'
                    controls
                    loop
                    src={videoAsset?.url}
                  />
                  <div className=' flex justify-between gap-20'>
                    <p className='text-lg'>{videoAsset.originalFilename}</p>
                    <button
                      type='button'
                      className=' rounded-full bg-gray-200 text-red-400 p-2 text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out'
                      onClick={() => setVideoAsset(undefined)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {wrongFileType && (
          <p className='text-center text-xl text-red-400 font-semibold mt-4 w-[260px]'>
           Porfavor Seleccionar archivo (mp4 o webm y ogg)
          </p>
        )}
      </div>
      <div className='flex flex-col gap-3 pb-10'>
        <label className='text-md font-medium '>Caption</label>
        <input
          type='text'
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className='rounded lg:after:w-650 outline-none text-md border-2 border-gray-200 p-2'
        />
        <label className='text-md font-medium '>Elegir  categoria</label>

        <select
          onChange={(e) => {
            setCategory(e.target.value)
          }}
          className='outline-none lg:w-650 border-2 border-gray-200 text-md capitalize lg:p-4 p-2 rounded cursor-pointer'
        >
          {topics.map((item) => (
            <option
              key={item.name}
              className=' outline-none capitalize bg-white text-gray-700 text-md p-2 hover:bg-slate-300'
              value={item.name}
            >
              {item.name}
            </option>
          ))}
        </select>
        <div className='flex gap-6 mt-10'>
          <button
            onClick={() => {}}
            type='button'
            className='border-gray-300 border-2 text-md font-medium p-2 rounded w-28 lg:w-44 outline-none'
          >
            Descartar
          </button>
          <button
            disabled={videoAsset?.url ? false : true}
            onClick={handlePost}
            type='button'
            className='bg-[#F51997] text-white text-md font-medium p-2 rounded w-28 lg:w-44 outline-none'
          >
            Postear
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Upload