import React from 'react'
import { DayPilot, DayPilotScheduler } from "daypilot-pro-react";
const calendar = () => {
    const nonBusinessDayClass = "non-business-day";
    const onBeforeTimeHeaderRender = (args) => {
        const date = new Date(args.header.start).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        });
        args.header.html = date;
        const nameOfDay = new Date(args.header.start).toLocaleDateString("en-US", {
            weekday: "long",
        });
        args.header.html = `<div class="day-header">
            <div class="day-of-week">${nameOfDay}</div>
            <div class="day-of-month">${date}</div>
          </div>`;
        if (args.header.start == DayPilot.Date.today()) {
         //   console.log('//Pink color should be added')
            args.header.backColor = "#f16667";
        }
    };


    return (
        <div>
            <DayPilotScheduler
                startDate="2023-03-22"
                days={50}
                cellWidth={150}
                cellDuration={30}
                onBeforeTimeHeaderRender={onBeforeTimeHeaderRender}
                timeHeaders={[
                    { groupBy: "Day", format: "d" }
                ]}
                onBeforeCellRender={(args) => {
                    if (args.cell.start == DayPilot.Date.today()) {
                        //Pink color should be added
                        args.cell.backColor = "#f9f1f1";
                    }

                }}
                // rowHeaderHideIconEnabled={true}
                rowHeaderColumnDefaultWidth={50}
                headerHeight={40}

                rowHeaderColumnResizedHandling={(args) => {
                 //   console.log(args);
                }}
                heightSpec="Fixed"
                rowMinHeight={60}
                rowMarginBottom={10}
                showNonBusiness={false}
                scale={'Day'}
                rowHeaderWidthAutoFit={true}
                resources={[
                    {
                        MinHeight: 60,
                        tooltip: "Tooltip for Resource 1", id: "101", Question: "Easily make an element as wide or as tal", Qno: "1.1", priority: "2", owner: ['Albert', 'Max'], wordCount: 100, color: "red", multiplier: 2
                    },
                    { id: "102", tooltip: "Tooltip for Resource 1", Question: " You can also use max-width Room 102", Qno: "1.2", priority: "3", owner: ['Albert', 'Max'], wordCount: 100, color: "grey", multiplier: 2 },
                    { id: "103", tooltip: "Tooltip for Resource 1", Question: "Quickly manage the layout, alignment, and sizing of grid columns, navigation, ", Qno: "1.3", priority: "1", owner: ['Albert', 'Max'], wordCount: 100, color: "pink", multiplier: 2 },
                    { id: "201", tooltip: "Tooltip for Resource 1", Question: "I'm a flexbox container!", Qno: "1.4", priority: "2", owner: ['Albert', 'Max'], wordCount: 100, color: "blue", multiplier: 2 },

                ]}
                rowHeaderColumns={[
                    { text: 'Priority', display: "priority" },
                    { text: 'Qno', display: "Qno" },
                    { text: 'Question Text', display: "Question", maxAutoWidth: 2000 }
                ]}
                showToolTip={false}

                onBeforeRowHeaderRender={(args) => {
                    args.row.toolTip = `${args.row.data.Question}`
                    args.row.columns[0].html = '<span class="priority-number">' + args.row.data.priority + '</span>';
                    args.row.columns[1].html = `<span class="rounded-number" style="color:white;background-color:${args.row.data.color};"  > ${args.row.data.Qno}</span>`;
                    args.row.columns[2].html = `<div  style="height: 400px;" class="row h-100 " >  
                       <div class="col-md-12">
                       <span class="question-title-calendar">${args.row.data.Question}</span> <br/>
                        <span class="calendar-info">WordCount: <span class="calendar-info-value">${args.row.data.wordCount}</span> </span>
                        <span class="calendar-info"> Owner: <span class="calendar-info-value">${args.row.data.owner.join(',')}</span> </span>
                        <span  class="calendar-info">Multiplier: <span class="calendar-info-value">${args.row.data.multiplier}</span> </span>
                       </div>
                 
                    </div>`;
                }}  
                  
                events={
                    [{
                    start: "2023-03-22T12:00:00",
                    end: "2023-03-22T12:00:00",
                    id: 1,
                    resource: "101",
                    text: "Answer Plan ",
                    day: 1,
                    owner: ['Albert', 'Max']

                },
                {
                    start: "2023-03-23T12:00:00",
                    end: "2023-03-23T12:00:00",
                    id: 2,
                    resource: "101",
                    text: "Story Board",
                    day: 0.4,
                    owner: ['Albert', 'Max']
                }
                    , {
                    start: "2023-03-27",
                    end: "2023-03-28",
                    id: 11,
                    resource: "103",
                    text: "Question Review",
                    day: 0.3,
                    owner: ['Albert', 'Max']
                },
                {
                    start: "2023-03-22",
                    end: "2023-03-23",
                    id: 101,
                    resource: "201",
                    text: "Resources Availbilty",
                    day: 1.4,
                    owner: ['Albert', 'Max']
                },
                {
                    start: "2023-03-23",
                    end: "2023-03-24",
                    id: 102,
                    resource: "201",
                    text: "Resources Availbilty",
                    day: 1.4,
                    owner: ['Albert', 'Max']
                } ]}
                eventMoveHandling="Update"
                eventResizeHandling="Disabled"
                onBeforeEventRender={(args) => {
                    args.data.moveVDisabled = true;
                    args.data.moveHDisabled = false;
                    args.data.html = `<span >${args.data.text} </br>
                    ${args.data.owner.join(',')} 
                     ${args.data.day}day
                   </span>`
                }}
                onEventMoving={(args) => {
                    args.html = `<span >${args.e.data.text} </br>
                    ${args.e.data.owner.join(',')} 
                     ${args.e.data.day}day
                   </span>`
                    args.cssClass = "text-center border border-danger"
                }}

            />

        </div >
    )
}


export default calendar