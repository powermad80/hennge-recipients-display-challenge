import { useEffect, useRef, useState } from "react";

export interface RecipientsDisplayProps {
    emails: string[]
  }

function useNumHiddenState() {
    return useState(0);
}

// calculates the number of hidden email addresses by determining which elements can fit inside the parent div
function getNumberHidden(parentDiv: any): number {
    var maxWidth: number = parentDiv['clientWidth'];
    var usedWidth: number = 0;
    var numHidden: number = parentDiv['children'].length;
    
    // assume they're all hidden at first calculation, decrement the return variable each time it's determined one can fit without causing overflow
    // HTML/CSS is actually handling the showing/hiding of the email addresses, this is just a calculation that can quantify what it's doing
    for (var i: number = 0; i < parentDiv['children'].length; i++) {
        // usedWidth is a running tally of how much space has been hypothetically used by the elements parsed so far. 
        // this decrements the return variable for each element which can fit in the cell with no overflow
        // the value of 20 added here is an offset that accounts for the ellipses. It was chosen by trial and error. I'm sorry.
        if (usedWidth + parentDiv['children'][i]['offsetWidth'] + 20 < maxWidth) {
            numHidden--;
            usedWidth = usedWidth + parentDiv['children'][i]['offsetWidth'];
        }
        else {
            break;
        }
    }
    return numHidden;
}

export default function RecipientsDisplay({ emails }: RecipientsDisplayProps) {
    const contRef = useRef(null);
    const [numHidden, setNumHidden] = useNumHiddenState();

    const parentDivStyle: object = { paddingTop: "5px", 
                             paddingBottom: "5px", 
                             paddingRight: "30px", 
                             textOverflow: 'ellipsis', 
                             overflow: 'hidden', 
                             margin: 'auto', 
                             position: "relative"};

    const firstEmailDivStyle: object = { overflow: 'hidden', 
                                         textOverflow: 'ellipsis', 
                                         display: "inline", 
                                         verticalAlign: "middle"};

    const normalEmailDivStyle: object = { overflow: 'hidden', 
                                          textOverflow: 'ellipsis', 
                                          display: "inline-block", 
                                          verticalAlign: "middle"};

    // none of the calculations for the badge number can function before render
    // therefore, put it in the useEffect
    useEffect(() => {
        const calcNumHidden = () => {
            if (contRef.current) {
                setNumHidden(getNumberHidden(contRef.current));
            }
        }
        
        // calculate the initial badge value
        calcNumHidden();

        // window resize handler function
        const handleResize = () => {
            calcNumHidden();
        }
        
        // recalculate the badge value anytime the window is resized
        window.addEventListener('resize', calcNumHidden);
        return () => window.removeEventListener('resize', handleResize);
    }, [numHidden])

    // if the first email displayed is overflowing, we don't want to count it in the badge number
    let badgeNum = numHidden;
    if (badgeNum == emails.length) {
        badgeNum = badgeNum - 1;
    }

    // if there's only one email, we don't have to worry about the badge at all, or any mapping functions.
    if (emails.length == 1) {
        return <div style={{ textOverflow: 'ellipsis', overflow: 'hidden'}}>
                    <div style={{overflow: 'hidden', textOverflow: 'ellipsis', display: "inline"}}>{emails[0]}</div>
                </div>
    }

    // create the badge component, but only if there's hidden emails. Otherwise, make it empty so it doesn't render
    if (numHidden > 0) {
        var badge = <span style={{ verticalAlign: "middle", paddingTop: "2px", paddingBottom: "2px", paddingRight: "5px", paddingLeft: "5px", borderRadius: "3px", backgroundColor: "#666666", color:"#f0f0f0", position: "absolute", right: 0, display: "block"}}>+{badgeNum}</span>;
    }
    else {
        var badge = <span></span>;
    }
    
    // for all non-easy cases, render the whole cell contents
    // Render the first email with normal text-overflow rules, then all subsequent ones to render as inline-block so the entire address shows, or it's omitted
    if (emails.length > 1) {
    return <div ref={contRef} style={parentDivStyle}>{badge}
            <div style={firstEmailDivStyle}>{emails[0]}<span>,&nbsp;</span></div>
                {emails.slice(1, emails.length - 1).map((email, index) => (
                    <div style={normalEmailDivStyle} key={index}>{email}<span>,&nbsp;</span></div>
                ))}
            <div style={normalEmailDivStyle}>{emails[emails.length - 1]}</div>
            </div>
    }
    
  }