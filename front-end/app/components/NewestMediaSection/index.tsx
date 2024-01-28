"use client"
import React, { SetStateAction, useEffect, useState } from 'react'
import styles from "./component.module.css"
import MediaListCoverInfo from '../MediaListCoverInfo'
import CardMediaCoverAndDescription from '../CardMediaCoverAndDescription'
import NavButtons from '../NavButtons'
import { ApiAiringMidiaResults, ApiDefaultResult } from '@/app/ts/interfaces/apiDataInterface'
import API from "@/api/anilistApi"
import { convertToUnix } from '@/app/lib/format_date_unix'

type PropsTypes = {

    data: void | ApiDefaultResult,
    currentQueryValue?: string

}

function NewestMediaSection(props: PropsTypes) {

    const [mediaList, setMediaList] = useState<ApiAiringMidiaResults[] | ApiAiringMidiaResults | null>(null)

    let { data } = props
    let currentQueryValue = 1 //stands for 1 day (today)

    // request new type of media then set them
    const loadMedia: (parameter: number) => void = async (parameter: number) => {
        console.log(`Received parameter: ${parameter}`);

        getMidiaByDaysRange(parameter)

        currentQueryValue = parameter

    }

    // gets the range of days than parse it to unix, runs function to get any midia releasing in the selected range
    async function getMidiaByDaysRange(days: number) {

        let response: ApiAiringMidiaResults | void

        response = await API.getReleasingByDaysRange("ANIME", convertToUnix(days)).then(res =>
        (res.map(
            (item: ApiAiringMidiaResults) => item.media).filter(
                (item) => item.isAdult == false)
        )
        )

        setMediaList(response)

    }

    return (
        <div id={styles.newest_conteiner}>

            <div className={styles.title_navbar_container}>

                <h3>Newest Animes Episodes</h3>

                <NavButtons
                    functionReceived={loadMedia}
                    actualValue={currentQueryValue}
                    options={[
                        { name: "Today", value: 1 }, { name: "This week", value: 7 }, { name: "Last 30 days", value: 30 }
                    ]} />

            </div>

            <ul>
                <li>
                    <CardMediaCoverAndDescription data={mediaList ? mediaList[0] : data[0]} />
                </li>

                {(mediaList || data).slice(1, 11).map((item: any, key: number) => (
                    <MediaListCoverInfo key={key} positionIndex={key + 1} data={item} showCoverArt={true} alternativeBorder={true} />
                ))}

            </ul>

        </div>
    )

}

export default NewestMediaSection