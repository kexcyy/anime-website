"use client"
import React, { useEffect, useState } from 'react'
import styles from "./component.module.css"
import Link from 'next/link';
import Image from 'next/image';
import NavButtons from '../NavButtons';
import gogoanime from '@/api/gogoanime';
import { MediaEpisodes, MediaInfo, MediaSearchResult } from '@/app/ts/interfaces/apiGogoanimeDataInterface';
import LoadingSvg from "@/public/assets/ripple-1s-200px.svg"
import placeholderImg from "@/public/photo-placeholder.jpg"

type EpisodesType = {
  site: string,
  url: string,
  thumbnail: string,
  title: string,
}

function EpisodesContainer(props: { data: EpisodesType[], mediaTitle: string, mediaId: number }) {

  const { data } = props

  const [loading, setLoading] = useState(false)
  const [episodesDataFetched, setEpisodesDataFetched] = useState<EpisodesType[] | MediaEpisodes[]>(data)

  const [episodeSource, setEpisodeSource] = useState<string>("crunchyroll")
  const [pageNumber, setPageNumber] = useState<number>(0)

  const rangeEpisodesPerPage = 25
  // the length os episodes array will be divided by 25, getting the range of pagination
  const paginationNumber = Math.ceil((episodesDataFetched.length + 1) / rangeEpisodesPerPage)

  // set new page of episodes
  const setNewPage: (parameter: number) => void = async (parameter: number) => {

    console.log(`Episodes Page Parameter: ${parameter} `)

    setPageNumber(parameter)

  }

  const setEpisodesSource: (parameter: string) => void = async (parameter: string) => {

    console.log(`Episodes Source Parameter: ${parameter} `)

    getEpisodesFromNewSource(parameter)

  }

  // get range within the episodes and returns array of values to be shown on nav buttons
  const returnPaginationRange = () => {

    let buttonsOptions = []

    for (let i = 1; i <= paginationNumber; i++) {

      buttonsOptions.push({ name: i.toString(), value: i })

    }

    return buttonsOptions

  }

  const getEpisodesFromNewSource = async (source: string) => {

    // if data props has 0 length, it is set to get data from gogoanime
    const chooseSource = source == "crunchyroll" && data.length == 0 ? "googanime" : source

    if (chooseSource == episodeSource) return

    setLoading(true)

    // reiniciate the episodes page counter
    setPageNumber(0)

    // transform title in some way it can get query by other sources removing special chars
    const query = props.mediaTitle.replace(/[^a-z]+/i, ' ').split(" ").join("-").toLowerCase()

    let mediaEpisodes

    switch (chooseSource) {

      case "crunchyroll":

        setEpisodesDataFetched(data)

        setEpisodeSource(chooseSource)

        setLoading(false)

        break

      // get data from gogoanime as default
      default:

        mediaEpisodes = await gogoanime.getInfoFromThisMedia(query, "anime") as MediaInfo

        // if the name dont match any results, it will search for the query on the api, than make a new request by the ID of the first result 
        if (mediaEpisodes == null) {
          const searchResultsForMedia = await gogoanime.searchMedia(query, "anime") as MediaSearchResult[]

          mediaEpisodes = await gogoanime.getInfoFromThisMedia(searchResultsForMedia[0].id, "anime") as MediaInfo
        }

        setEpisodeSource(chooseSource)

        setEpisodesDataFetched(mediaEpisodes.episodes)

        setLoading(false)

        break

    }

  }

  useEffect(() => {
    // if there is no episodes on crunchyroll, gets episodes from other source
    getEpisodesFromNewSource(episodeSource)

    returnPaginationRange()
  }, [])

  return (
    <div>

      <div id={styles.container_heading}>

        <NavButtons
          functionReceived={setEpisodesSource as (parameter: string | number) => void}
          actualValue={episodeSource == "crunchyroll" && data.length == 0 ? "gogoanime" : episodeSource}
          options={data.length == 0 ?
            [{ name: "GoGoAnime", value: "gogoanime" }] :
            [{ name: "Crunchyroll", value: "crunchyroll" }, { name: "GoGoAnime", value: "gogoanime" }]
          }
          sepateWithSpan={true}
        />

      </div>

      <ol id={styles.container} data-loading={loading}>

        {episodesDataFetched.slice(
          //if page is on 0 (is the default page number), it just begins from 0, after that it multiples by the number of page 
          (pageNumber != 0 ? (rangeEpisodesPerPage * (pageNumber - 1)) : 0),
          //if page is on 0, it will be set as 25, after that it multiples by the number of page 
          (pageNumber != 0 ? (rangeEpisodesPerPage * (pageNumber)) : (rangeEpisodesPerPage * (pageNumber + 1)))
        ).map((item, key: number) => (

          <li key={key}>

            {episodeSource != "crunchyroll" ? (

              !loading && (
                <>
                  <Link href={`/watch/${props.mediaId}?q=${(item as MediaEpisodes).id}`} className={styles.img_container}>
                    <Image
                      src={placeholderImg}
                      data-other-source={true}
                      fill
                      sizes='100%'
                      alt={`Watch episode ${(item as MediaEpisodes).number}`}
                      placeholder='blur'
                      blurDataURL={'data:image/svg+xml;base64,CiAgICA8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDggNSc+CiAgICAgIDxmaWx0ZXIgaWQ9J2InIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0nc1JHQic+CiAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0nMScgLz4KICAgICAgPC9maWx0ZXI+CgogICAgICA8aW1hZ2UgcHJlc2VydmVBc3BlY3RSYXRpbz0nbm9uZScgZmlsdGVyPSd1cmwoI2IpJyB4PScwJyB5PScwJyBoZWlnaHQ9JzEwMCUnIHdpZHRoPScxMDAlJyAKICAgICAgaHJlZj0nZGF0YTppbWFnZS9hdmlmO2Jhc2U2NCwvOWovMndCREFBZ0dCZ2NHQlFnSEJ3Y0pDUWdLREJRTkRBc0xEQmtTRXc4VUhSb2ZIaDBhSEJ3Z0pDNG5JQ0lzSXh3Y0tEY3BMREF4TkRRMEh5YzVQVGd5UEM0ek5ETC8yd0JEQVFrSkNRd0xEQmdORFJneUlSd2hNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpML3dBQVJDQUFMQUJBREFTSUFBaEVCQXhFQi84UUFGZ0FCQVFFQUFBQUFBQUFBQUFBQUFBQUFCZ01ILzhRQUloQUFBZ0lDQWdFRkFRQUFBQUFBQUFBQUFRSURCQVVSQUNFU0JoTVVNVUhCLzhRQUZRRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBTC94QUFaRVFBREFBTUFBQUFBQUFBQUFBQUFBQUFBQVJFQ0lUSC8yZ0FNQXdFQUFoRURFUUEvQU5KdFhNbEZqekxjaGZIMVl4dDVQa3B2ZjUzL0FEWGZJeGVzemtFclJZK3V0eVYxVVNsU3dDc1U4aHM2ME5nRTY0aEVVZCtrOWEzR2swRWkrTG82Z2dnOWNNNTJOYU9GdFdxbzltWlN6cXlIV2pvOWdmWDd3M3VsNHpoLy85az0nIC8+CiAgICA8L3N2Zz4KICA='}>
                    </Image>
                  </Link>

                  <div>
                    <h3>
                      <Link href={`/watch/${props.mediaId}?q=${(item as MediaEpisodes).id}`}>
                        {`Episode ${(item as MediaEpisodes).number}`}
                      </Link>
                    </h3>
                  </div>
                </>
              )
            ) : (
              !loading && (
                <>
                  <Link href={item.url} className={styles.img_container} target='_blank'>
                    <Image
                      src={(item as EpisodesType).thumbnail}
                      fill
                      sizes='100%'
                      alt={`Watch ${(item as EpisodesType).title}`}
                      placeholder='blur'
                      blurDataURL={'data:image/svg+xml;base64,CiAgICA8c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDggNSc+CiAgICAgIDxmaWx0ZXIgaWQ9J2InIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0nc1JHQic+CiAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0nMScgLz4KICAgICAgPC9maWx0ZXI+CgogICAgICA8aW1hZ2UgcHJlc2VydmVBc3BlY3RSYXRpbz0nbm9uZScgZmlsdGVyPSd1cmwoI2IpJyB4PScwJyB5PScwJyBoZWlnaHQ9JzEwMCUnIHdpZHRoPScxMDAlJyAKICAgICAgaHJlZj0nZGF0YTppbWFnZS9hdmlmO2Jhc2U2NCwvOWovMndCREFBZ0dCZ2NHQlFnSEJ3Y0pDUWdLREJRTkRBc0xEQmtTRXc4VUhSb2ZIaDBhSEJ3Z0pDNG5JQ0lzSXh3Y0tEY3BMREF4TkRRMEh5YzVQVGd5UEM0ek5ETC8yd0JEQVFrSkNRd0xEQmdORFJneUlSd2hNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpJeU1qSXlNakl5TWpML3dBQVJDQUFMQUJBREFTSUFBaEVCQXhFQi84UUFGZ0FCQVFFQUFBQUFBQUFBQUFBQUFBQUFCZ01ILzhRQUloQUFBZ0lDQWdFRkFRQUFBQUFBQUFBQUFRSURCQVVSQUNFU0JoTVVNVUhCLzhRQUZRRUJBUUFBQUFBQUFBQUFBQUFBQUFBQUFBTC94QUFaRVFBREFBTUFBQUFBQUFBQUFBQUFBQUFBQVJFQ0lUSC8yZ0FNQXdFQUFoRURFUUEvQU5KdFhNbEZqekxjaGZIMVl4dDVQa3B2ZjUzL0FEWGZJeGVzemtFclJZK3V0eVYxVVNsU3dDc1U4aHM2ME5nRTY0aEVVZCtrOWEzR2swRWkrTG82Z2dnOWNNNTJOYU9GdFdxbzltWlN6cXlIV2pvOWdmWDd3M3VsNHpoLy85az0nIC8+CiAgICA8L3N2Zz4KICA='}>
                    </Image>
                  </Link>

                  <div>
                    <h3>
                      <Link href={(item as EpisodesType).url} target='_blank'>
                        {(item as EpisodesType).title}
                      </Link>
                    </h3>
                  </div>
                </>
              )
            )}

            {loading && (
              <LoadingSvg width={16} height={16} alt="Loading Episodes" />
            )}

          </li>
        ))}

      </ol>

      {episodesDataFetched.length == 0 && (
        <p>No episodes available.</p>
      )}

      <nav id={styles.pagination_buttons_container}>

        <NavButtons
          functionReceived={setNewPage as (parameter: string | number) => void}
          options={returnPaginationRange()}
          actualValue={pageNumber}
          previousAndNextButtons={true}
          customForPagination={true}
        />

      </nav>

    </div >
  )
}

export default EpisodesContainer