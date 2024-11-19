import { Typography } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

export default function CustomTooltip(props: any) {

    const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip arrow {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: "#2A2F42",
            color: 'white',
            boxShadow: theme.shadows[1],
            fontSize: 11,
        },
        '& .MuiTooltip-arrow': {
            color: "#2A2F42"
        }
    }));

    return (
        <>
            <CustomTooltip
                title={props?.forums_info && props?.forums_info?.map((item: any, i: any) => {
                    return <Typography key={i} variant='caption'>{item?.forum_name}<br /></Typography>
                })}
                disableHoverListener={!props?.forums_info?.length}
                placement="bottom"
                arrow
            >
                <Typography variant="caption">
                    Forum:&nbsp;
                    {props?.forums_info[0]?.forum_name ?
                        (props.forums_info[0]?.forum_name.length <= 15 ?
                            `${props.forums_info[0].forum_name}` :
                            `${props.forums_info[0].forum_name.substring(0, 10)}...`)
                        :
                        "None"}
                </Typography>
            </CustomTooltip>

        </>
    )
}


