package fr.butinfo.r508.billetterie.repository;

import fr.butinfo.r508.billetterie.domain.Seance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SeanceRepository extends JpaRepository<Seance, Long> {

    @Query("""
            select s from Seance s
            join fetch s.film
            join fetch s.salle
            where s.debut >= :du and s.debut < :au
            order by s.debut
            """)
    List<Seance> findByPeriode(@Param("du") LocalDateTime du, @Param("au") LocalDateTime au);

    @Query("""
            select s from Seance s
            join fetch s.film
            join fetch s.salle
            where s.id = :id
            """)
    Optional<Seance> findByIdAvecReferences(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seance s where s.id = :id")
    Optional<Seance> findByIdForUpdate(@Param("id") Long id);
}
