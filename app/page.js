'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { getDocs, collection, query, getDoc, deleteDoc, setDoc, doc } from "@firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })

    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
      const {quantity} = docSnap.data();
      if(quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  useEffect(()=>{
    updateInventory();
  }, [])

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredInventory(inventory)
    } else {
      setFilteredInventory(
        inventory.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [searchQuery, inventory])

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%" sx={{transform: 'translate(-50%, -50%)'}} width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3}>
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField variant="outlined" fullWidth value={itemName} onChange={(e)=>{setItemName(e.target.value)}}/>
            <Button
              variant="outlined"
              onClick={()=>{
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box width="800px" bgcolor="ADDE86" display="flex" alignItems="center" justifyContent="center" >
          <Typography variant="h2" color="#333">Inventory Items</Typography>
      </Box>
      <Stack width="100%" height="75px" direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <TextField
            id="search"
            label="Search the Pantry"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" onClick={()=> {
          handleOpen() 
        }}>
          Add New Item
        </Button>
      </Stack>

      <Box>
        <Stack width="60vw" height="450px" spacing={1} overflow="auto" >
          {
            filteredInventory.map(({name, quantity}) => (
              <Box key={name} width="100%" minHeight="100px" display="flex" alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={4} borderRadius={4}>
                <Typography variant="h4" color="#333" textAlign="center">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                <Stack direction="row" spacing={2}>
                  <Typography sx={{mr: '250px'}} variant="h6" color="#333">Count: {quantity}</Typography>
                  <Button variant="contained" onClick={()=>{addItem(name)}}>+</Button>
                  <Button variant="contained" color="error" onClick={()=>{removeItem(name)}}>-</Button>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
}