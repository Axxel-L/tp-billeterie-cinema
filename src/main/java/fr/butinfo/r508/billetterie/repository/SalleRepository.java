package fr.butinfo.r508.billetterie.repository;

import fr.butinfo.r508.billetterie.domain.Salle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalleRepository extends JpaRepository<Salle, Long> {

    boolean existsByNomIgnoreCase(String nom);

    List<Salle> findAllByOrderByNomAsc();
}
