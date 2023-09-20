import React, { FC, useState } from 'react';
import { Button, Chip, CircularProgress, Divider, IconButton, LinearProgress, Theme, Typography } from '@mui/material';
import { withStyles, WithStyles } from '@mui/styles'
import ImageStatisticsModal from '../modals/ImageStatisticsModal';
import Modal from '@mui/material/Modal';
import ImageStatisticsGraph from '../ImageStatisticsGraph';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useAcceleratedMedia } from '../context/AcceleratedMediaContext';
import { DetermineImageSizes, ImageStatistics } from '../ImageStatistics';

function getProgress(stats: ImageStatistics[]): number {
    let completed = 0;
    let total = 0;

    for (const stat of stats) {
        completed += stat.completed;
        total += stat.total;
    }

    return 100 * (completed / total);
}

const VisibilityToggle = ({ selected, onClick }: any) => {
    return <IconButton size="small" color={selected ? "primary" : "default"} onClick={onClick}>
        {selected && <CheckBoxIcon />}
        {!selected && <CheckBoxOutlineBlankIcon />}
    </IconButton>
}

const styles = (theme: Theme) => ({
    root: {
        width: '100%'
    },
    button: {
        marginTop: 12,
        marginBottom: 12
    },
    input: {
    },
    progress: {
    },
    table: {
        width: '100%'
    }
});

interface Props extends WithStyles<typeof styles> {
    className?: string;
    style?: React.CSSProperties
}

const AcceleratedMediaPanel: FC<Props> = (props) => {
    const {
        classes,
        ...other
    } = props;

    const [calculating, setCalculating] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [result, setResult] = useState<ImageStatistics[]>([]);

    const closeModal = () => {
        setModalOpen(false);
    }

    const openModal = () => {
        setModalOpen(true);
    }

    const startCalculating = async () => {
        setCalculating(true);
        await DetermineImageSizes((result) => { setResult([...result]) });
        setCalculating(false);
    }

    const {
        acceleratedMedia,
        setAcceleratedMedia
    } = useAcceleratedMedia();

    const toggleAcceleratedMedia = () => {
        setAcceleratedMedia(!acceleratedMedia);
    }

    return (<>
        <Table size="small" className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Configuration</TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow key={"content"}>
                    <TableCell>Enable Accelerated Media</TableCell>
                    <TableCell align="right">
                        <VisibilityToggle selected={acceleratedMedia} onClick={toggleAcceleratedMedia} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
        <form noValidate>
            <Button className={classes.button} startIcon={calculating && <CircularProgress className={classes.progress} size="1em" color="primary" />} variant="contained" color="primary" size='small' onClick={startCalculating} disabled={calculating}>
                Get Image Statistics
            </Button>
            <Modal 
                open={modalOpen} 
                onClose={closeModal}
            >
                <ImageStatisticsModal stats={result} onClose={closeModal} />
            </Modal>
            {
                result.length == 0 &&
                <Typography component="p">No Amplience image detected.</Typography>
            }
            {
                result.length > 0 && <>
                    <Typography component="p">
                        {result.length} Amplience image{result.length > 1 && 's'} detected.
                    </Typography>
                    <LinearProgress variant="determinate" value={getProgress(result)} />
                    <ImageStatisticsGraph stats={result} />
                    {
                        !calculating && result.length > 0 && <>
                            <Button variant="outlined" color="primary" onClick={openModal} size='small'>
                                Open Details
                            </Button>
                        </>
                    }
                </>
            }
        </form>
    </>);
};

export default withStyles(styles)(AcceleratedMediaPanel);